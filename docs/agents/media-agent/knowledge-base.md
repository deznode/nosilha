# Media Agent Knowledge Base

## Domain Expertise: AI-Powered Media Processing + Cloud Storage

### Architecture Overview
```
File Upload (Frontend)
    ↓
Google Cloud Storage (Media Assets)
    ↓
Cloud Vision API (AI Analysis)
    ↓
Firestore (Metadata Storage)
    ↓
Enhanced Tourism Content
```

### Key Technologies
- **Google Cloud Storage** - Scalable media asset storage with CDN
- **Cloud Vision API** - AI image analysis, OCR, and landmark detection
- **Google Firestore** - Flexible metadata storage for AI-processed results
- **Spring Boot FileStorageService** - Backend upload and processing coordination
- **Next.js Image Optimization** - Frontend media display and lazy loading

## Core Media Processing Patterns

### 1. File Upload Workflow
```kotlin
// Backend: FileUploadController.kt
@RestController
@RequestMapping("/api/v1/media")
@CrossOrigin(origins = ["\${app.cors.allowed-origins}"])
class FileUploadController(
    private val fileStorageService: FileStorageService,
    private val aiService: AIService
) {
    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("category") category: String,
        @RequestParam("entryId", required = false) entryId: UUID?
    ): ResponseEntity<ApiResponse<MediaMetadataDto>> {
        return try {
            // Validate file type and size
            validateFile(file)
            
            // Upload to Google Cloud Storage
            val gcsPath = fileStorageService.uploadFile(file, category)
            
            // Process with AI (async)
            val aiAnalysis = aiService.analyzeImage(gcsPath)
            
            // Store metadata
            val metadata = MediaMetadataDto(
                id = UUID.randomUUID(),
                fileName = file.originalFilename ?: "unknown",
                gcsPath = gcsPath,
                contentType = file.contentType ?: "application/octet-stream",
                fileSize = file.size,
                category = category,
                aiAnalysis = aiAnalysis,
                entryId = entryId,
                uploadedAt = Instant.now()
            )
            
            ResponseEntity.ok(ApiResponse.success(metadata))
        } catch (e: Exception) {
            logger.error("File upload failed", e)
            ResponseEntity.badRequest()
                .body(ApiResponse.error("Upload failed: ${e.message}"))
        }
    }
    
    private fun validateFile(file: MultipartFile) {
        // Check file size (max 10MB for tourism images)
        if (file.size > 10 * 1024 * 1024) {
            throw IllegalArgumentException("File size exceeds 10MB limit")
        }
        
        // Check file type
        val allowedTypes = setOf(
            "image/jpeg", "image/png", "image/webp", 
            "video/mp4", "video/webm"
        )
        if (file.contentType !in allowedTypes) {
            throw IllegalArgumentException("Unsupported file type: ${file.contentType}")
        }
    }
}
```

### 2. Google Cloud Storage Integration
```kotlin
// Backend: FileStorageService.kt
@Service
class FileStorageService(
    @Value("\${gcp.storage.bucket-name}") private val bucketName: String
) {
    private val storage = StorageOptions.getDefaultInstance().service
    
    fun uploadFile(file: MultipartFile, category: String): String {
        val fileName = generateFileName(file.originalFilename ?: "unknown", category)
        val blobId = BlobId.of(bucketName, fileName)
        
        val blobInfo = BlobInfo.newBuilder(blobId)
            .setContentType(file.contentType)
            .setMetadata(mapOf(
                "category" to category,
                "uploaded-at" to Instant.now().toString(),
                "original-name" to (file.originalFilename ?: "unknown")
            ))
            .build()
            
        // Upload with tourism-specific settings
        storage.create(
            blobInfo, 
            file.bytes,
            Storage.BlobTargetOption.predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ)
        )
        
        return "gs://$bucketName/$fileName"
    }
    
    fun getPublicUrl(gcsPath: String): String {
        val fileName = gcsPath.removePrefix("gs://$bucketName/")
        return "https://storage.googleapis.com/$bucketName/$fileName"
    }
    
    private fun generateFileName(originalName: String, category: String): String {
        val timestamp = Instant.now().epochSecond
        val extension = originalName.substringAfterLast('.', "")
        val safeName = originalName.substringBeforeLast('.').replace(Regex("[^a-zA-Z0-9-_]"), "-")
        
        return "$category/${timestamp}_${safeName}.$extension"
    }
}
```

### 3. AI-Powered Image Analysis
```kotlin
// Backend: AIService.kt
@Service
class AIService {
    private val imageAnnotatorClient = ImageAnnotatorClient.create()
    
    fun analyzeImage(gcsPath: String): AIAnalysisResult {
        val image = Image.newBuilder()
            .setSource(ImageSource.newBuilder().setGcsImageUri(gcsPath))
            .build()
            
        // Comprehensive tourism-focused analysis
        val features = listOf(
            Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).setMaxResults(10).build(),
            Feature.newBuilder().setType(Feature.Type.LANDMARK_DETECTION).setMaxResults(5).build(),
            Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build(),
            Feature.newBuilder().setType(Feature.Type.OBJECT_LOCALIZATION).setMaxResults(10).build(),
            Feature.newBuilder().setType(Feature.Type.IMAGE_PROPERTIES).build()
        )
        
        val request = AnnotateImageRequest.newBuilder()
            .addAllFeatures(features)
            .setImage(image)
            .build()
            
        val response = imageAnnotatorClient.batchAnnotateImages(listOf(request))
        val annotation = response.responsesList[0]
        
        return AIAnalysisResult(
            labels = annotation.labelAnnotationsList.map { 
                AILabel(it.description, it.score) 
            },
            landmarks = annotation.landmarkAnnotationsList.map {
                AILandmark(it.description, it.score, it.locationsList.map { loc ->
                    LatLng(loc.latLng.latitude, loc.latLng.longitude)
                })
            },
            extractedText = annotation.fullTextAnnotation?.text,
            objects = annotation.localizedObjectAnnotationsList.map {
                AIObject(it.name, it.score)
            },
            dominantColors = annotation.imagePropertiesAnnotation.dominantColorsAnnotation
                .colorsList.take(5).map { 
                    AIColor(it.color.red, it.color.green, it.color.blue, it.score) 
                },
            isAppropriate = checkContentSafety(annotation.safeSearchAnnotation)
        )
    }
    
    private fun checkContentSafety(safeSearch: SafeSearchAnnotation): Boolean {
        return safeSearch.adult != Likelihood.LIKELY &&
               safeSearch.adult != Likelihood.VERY_LIKELY &&
               safeSearch.violence != Likelihood.LIKELY &&
               safeSearch.violence != Likelihood.VERY_LIKELY
    }
}

// Data classes for AI analysis results
data class AIAnalysisResult(
    val labels: List<AILabel>,
    val landmarks: List<AILandmark>,
    val extractedText: String?,
    val objects: List<AIObject>,
    val dominantColors: List<AIColor>,
    val isAppropriate: Boolean
)

data class AILabel(val description: String, val confidence: Float)
data class AILandmark(val name: String, val confidence: Float, val locations: List<LatLng>)
data class AIObject(val name: String, val confidence: Float)
data class AIColor(val red: Int, val green: Int, val blue: Int, val score: Float)
```

### 4. Firestore Metadata Storage
```kotlin
// Backend: ImageMetadataRepository.kt
@Repository
class ImageMetadataRepository {
    private val firestore = FirestoreOptions.getDefaultInstance().service
    
    suspend fun saveImageMetadata(metadata: ImageMetadata): String {
        val docRef = firestore.collection("image_metadata").document()
        
        val data = mapOf(
            "fileName" to metadata.fileName,
            "gcsPath" to metadata.gcsPath,
            "contentType" to metadata.contentType,
            "fileSize" to metadata.fileSize,
            "category" to metadata.category.name,
            "aiAnalysis" to mapOf(
                "labels" to metadata.aiAnalysis.labels.map { 
                    mapOf("description" to it.description, "confidence" to it.confidence)
                },
                "landmarks" to metadata.aiAnalysis.landmarks.map {
                    mapOf("name" to it.name, "confidence" to it.confidence)
                },
                "extractedText" to metadata.aiAnalysis.extractedText,
                "isAppropriate" to metadata.aiAnalysis.isAppropriate
            ),
            "uploadedAt" to metadata.uploadedAt.toEpochMilli(),
            "entryId" to metadata.entryId?.toString()
        )
        
        docRef.set(data).get()
        return docRef.id
    }
    
    suspend fun findByEntryId(entryId: UUID): List<ImageMetadata> {
        val query = firestore.collection("image_metadata")
            .whereEqualTo("entryId", entryId.toString())
            .orderBy("uploadedAt", Query.Direction.DESCENDING)
            
        return query.get().get().documents.map { doc ->
            mapDocumentToImageMetadata(doc)
        }
    }
    
    suspend fun searchByLabels(labels: List<String>): List<ImageMetadata> {
        // Firestore array-contains-any query for label-based search
        val query = firestore.collection("image_metadata")
            .whereArrayContainsAny("aiAnalysis.labels.description", labels)
            
        return query.get().get().documents.map { doc ->
            mapDocumentToImageMetadata(doc)
        }
    }
}
```

## Frontend Media Components

### 1. Image Upload Component
```typescript
// Frontend: ImageUploader.tsx
'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { apiClient } from '@/lib/api'

interface ImageUploaderProps {
  category: Category
  entryId?: string
  onUploadComplete?: (metadata: MediaMetadata) => void
  maxFiles?: number
}

export function ImageUploader({ 
  category, 
  entryId, 
  onUploadComplete, 
  maxFiles = 5 
}: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<MediaMetadata[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        if (entryId) {
          formData.append('entryId', entryId)
        }
        
        // Upload with progress tracking
        const metadata = await uploadWithProgress(formData, file.name)
        
        setUploadedFiles(prev => [...prev, metadata])
        onUploadComplete?.(metadata)
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      } catch (error) {
        console.error('Upload failed:', error)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 })) // Error state
      }
    }
    
    setUploading(false)
  }, [category, entryId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-ocean-blue bg-ocean-blue/5' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="text-4xl">📷</div>
          
          {isDragActive ? (
            <p className="text-lg font-medium text-ocean-blue">
              Drop your tourism photos here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload Tourism Photos & Videos
              </p>
              <p className="text-sm text-gray-500">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPEG, PNG, WebP, MP4, WebM (max 10MB each)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium truncate">{fileName}</span>
                <span className="text-xs text-gray-500">
                  {progress === -1 ? 'Error' : `${progress}%`}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === -1 ? 'bg-red-500' : 'bg-ocean-blue'
                  }`}
                  style={{ width: `${Math.max(0, progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={file.publicUrl}
                  alt={file.fileName}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-white text-center text-xs">
                    <div className="font-medium">{file.fileName}</div>
                    {file.aiAnalysis?.labels?.slice(0, 2).map(label => (
                      <div key={label.description} className="text-white/80">
                        {label.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function for upload with progress
async function uploadWithProgress(
  formData: FormData, 
  fileName: string
): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        // Update progress state here
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve(response.data)
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'))
    })
    
    xhr.open('POST', '/api/v1/media/upload')
    xhr.send(formData)
  })
}
```

### 2. AI-Enhanced Gallery Component
```typescript
// Frontend: AIGallery.tsx
interface AIGalleryProps {
  entryId?: string
  category?: Category
  searchLabels?: string[]
  onImageSelect?: (image: MediaMetadata) => void
}

export function AIGallery({ 
  entryId, 
  category, 
  searchLabels, 
  onImageSelect 
}: AIGalleryProps) {
  const [images, setImages] = useState<MediaMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLabels, setSelectedLabels] = useState<string[]>(searchLabels || [])

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        let imageList: MediaMetadata[]
        
        if (entryId) {
          imageList = await apiClient.getImagesByEntry(entryId)
        } else if (selectedLabels.length > 0) {
          imageList = await apiClient.searchImagesByLabels(selectedLabels)
        } else {
          imageList = await apiClient.getAllImages(category)
        }
        
        setImages(imageList)
      } catch (error) {
        console.error('Failed to fetch images:', error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [entryId, category, selectedLabels])

  // Extract all unique labels from images for filtering
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>()
    images.forEach(image => {
      image.aiAnalysis?.labels?.forEach(label => {
        if (label.confidence > 0.7) { // Only high-confidence labels
          labelSet.add(label.description)
        }
      })
    })
    return Array.from(labelSet).sort()
  }, [images])

  if (loading) {
    return <GallerySkeleton />
  }

  return (
    <div className="space-y-6">
      {/* AI-Powered Label Filters */}
      {availableLabels.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Filter by AI-detected content:
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {availableLabels.map(label => (
              <button
                key={label}
                onClick={() => {
                  setSelectedLabels(prev => 
                    prev.includes(label) 
                      ? prev.filter(l => l !== label)
                      : [...prev, label]
                  )
                }}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${selectedLabels.includes(label)
                    ? 'bg-ocean-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {label}
              </button>
            ))}
            
            {selectedLabels.length > 0 && (
              <button
                onClick={() => setSelectedLabels([])}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI-Enhanced Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onClick={() => onImageSelect?.(image)}
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={image.publicUrl}
                alt={image.fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* AI Analysis Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <div className="absolute bottom-2 left-2 right-2 text-white">
                {/* Top AI labels */}
                <div className="text-xs space-y-1">
                  {image.aiAnalysis?.labels?.slice(0, 3).map(label => (
                    <div key={label.description} className="flex justify-between">
                      <span>{label.description}</span>
                      <span className="text-white/70">
                        {Math.round(label.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Landmarks detected */}
                {image.aiAnalysis?.landmarks?.length > 0 && (
                  <div className="text-xs mt-2 text-yellow-200">
                    📍 {image.aiAnalysis.landmarks[0].name}
                  </div>
                )}
                
                {/* Text detected */}
                {image.aiAnalysis?.extractedText && (
                  <div className="text-xs mt-2 text-blue-200">
                    💬 Text detected
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No images found
          </h3>
          <p className="text-gray-500">
            {selectedLabels.length > 0 
              ? 'Try adjusting your filters or upload some images'
              : 'Upload some tourism photos to get started'
            }
          </p>
        </div>
      )}
    </div>
  )
}
```

## Performance Optimization

### 1. Image Processing Pipeline
```kotlin
// Async processing for large images
@Service
class MediaProcessingService(
    private val fileStorageService: FileStorageService,
    private val aiService: AIService
) {
    
    @Async
    fun processImageAsync(gcsPath: String, metadata: ImageMetadata) {
        try {
            // Generate multiple sizes for responsive delivery
            val sizes = listOf(
                ImageSize(150, 150, "thumbnail"),
                ImageSize(300, 300, "small"),
                ImageSize(800, 600, "medium"),
                ImageSize(1200, 900, "large")
            )
            
            sizes.forEach { size ->
                val resizedPath = resizeImage(gcsPath, size)
                metadata.variants[size.name] = resizedPath
            }
            
            // AI analysis
            val aiAnalysis = aiService.analyzeImage(gcsPath)
            metadata.aiAnalysis = aiAnalysis
            
            // Save updated metadata
            imageMetadataRepository.save(metadata)
            
        } catch (e: Exception) {
            logger.error("Failed to process image: $gcsPath", e)
        }
    }
    
    private fun resizeImage(gcsPath: String, size: ImageSize): String {
        // Use Cloud Functions or ImageIO for image resizing
        // Return path to resized image in GCS
    }
}
```

### 2. CDN Integration
```kotlin
// CDN-optimized URLs for tourism images
@Service
class CDNService(
    @Value("\${cdn.base-url:}") private val cdnBaseUrl: String
) {
    
    fun getOptimizedImageUrl(
        gcsPath: String, 
        width: Int? = null, 
        height: Int? = null,
        format: String = "webp",
        quality: Int = 85
    ): String {
        if (cdnBaseUrl.isBlank()) {
            return fileStorageService.getPublicUrl(gcsPath)
        }
        
        val fileName = gcsPath.removePrefix("gs://bucket-name/")
        val params = mutableListOf<String>()
        
        width?.let { params.add("w_$it") }
        height?.let { params.add("h_$it") }
        params.add("f_$format")
        params.add("q_$quality")
        
        return "$cdnBaseUrl/${params.joinToString(",")}/$fileName"
    }
}
```

This knowledge base provides comprehensive coverage of AI-powered media processing, cloud storage integration, and tourism-focused image management for the Nos Ilha platform.