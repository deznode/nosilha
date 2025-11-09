'use client';

import React, { useState } from 'react';
import { LinkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '../catalyst-ui/button';

interface CopyLinkButtonProps {
  /**
   * URL to copy to clipboard
   */
  url: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Copy Link Button Component
 *
 * Provides a simple way to copy the page URL to the clipboard.
 * Serves as a fallback for devices without Web Share API support.
 *
 * **Behavior**:
 * - Copies URL to clipboard using Clipboard API
 * - Shows visual confirmation with CheckIcon for 2-3 seconds
 * - Announces success to screen readers via ARIA live region
 *
 * **Accessibility**:
 * - ARIA live region announces "Link copied to clipboard"
 * - Clear visual feedback with icon swap
 * - Keyboard accessible (Enter/Space)
 * - Button disabled during confirmation period
 *
 * @example
 * <CopyLinkButton url="https://nosilha.com/directory/entry/eugenio-tavares-monument" />
 */
export function CopyLinkButton({
  url,
  className = '',
}: CopyLinkButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  /**
   * Handle copy button click
   * Copies URL to clipboard and shows confirmation
   */
  const handleCopy = async () => {
    try {
      // Check if Clipboard API is available
      if (navigator.clipboard) {
        // Copy URL to clipboard
        await navigator.clipboard.writeText(url);

        // Success - update status
        setStatus('copied');

        // Reset status after 2.5 seconds
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        // Fallback for browsers without Clipboard API
        // Create temporary text area to copy from
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          setStatus('copied');
          setTimeout(() => setStatus('idle'), 2500);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          setStatus('error');
          setTimeout(() => setStatus('idle'), 2500);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      // Handle errors
      console.error('Copy failed:', error);
      setStatus('error');

      // Reset error status after 2.5 seconds
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  // Determine button icon based on status (T021: Visual confirmation with CheckIcon swap)
  const Icon = status === 'copied' ? CheckIcon : LinkIcon;

  // Determine button label based on status
  const getButtonLabel = () => {
    switch (status) {
      case 'copied':
        return 'Copied!';
      case 'error':
        return 'Failed';
      default:
        return 'Copy Link';
    }
  };

  return (
    <>
      <Button
        type="button"
        outline
        onClick={handleCopy}
        className={className}
        aria-label="Copy link to clipboard"
        disabled={status === 'copied'}
      >
        <Icon data-slot="icon" />
        {getButtonLabel()}
      </Button>

      {/* T022: ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === 'copied' && 'Link copied to clipboard'}
        {status === 'error' && 'Failed to copy link'}
      </div>
    </>
  );
}
