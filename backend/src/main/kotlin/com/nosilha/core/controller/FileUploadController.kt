package com.nosilha.core.controller

import com.nosilha.core.service.FileStorageService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * REST controller for handling media-related operations, such as file uploads.
 *
 * @param fileStorageService The service responsible for the underlying file storage logic.
 */
@RestController
@RequestMapping("/api/v1/media")
class FileUploadController(
  private val fileStorageService: FileStorageService
) {

  /**
   * Handles the uploading of a single file via a multipart/form-data request.
   *
   * Upon successful upload, it returns a JSON object containing the publicly
   * accessible URL of the file. The `@ResponseStatus(HttpStatus.CREATED)`
   * annotation ensures a 201 status code is returned on success.
   *
   * @param file The file to be uploaded, bound from the "file" part of the request.
   * @return A map containing the file's public URL, which will be serialized to JSON.
   */
  @PostMapping("/upload")
  @ResponseStatus(HttpStatus.CREATED)
  fun uploadFile(@RequestParam("file") file: MultipartFile): Map<String, String> {
    val publicUrl = fileStorageService.uploadFile(file)
    return mapOf("url" to publicUrl)
  }
}