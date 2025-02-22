// "use client"
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { EquipmentImage } from '@/types/equipment';
// import { ChevronLeft, ChevronRight, X } from "lucide-react";
// import Image from "next/image";
// import { useEffect, useState } from 'react';

// interface ImageModalProps {
//   images: EquipmentImage[];
//   initialIndex: number;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
//   const [currentIndex, setCurrentIndex] = useState(initialIndex);

//   // Reset currentIndex when modal opens or initialIndex changes
//   useEffect(() => {
//     if (isOpen && initialIndex >= 0 && initialIndex < images.length) {
//       setCurrentIndex(initialIndex);
//     }
//   }, [isOpen, initialIndex, images.length]);

//   // Safety check - if no images or invalid index, close modal
//   if (!images.length || currentIndex < 0 || currentIndex >= images.length) {
//     return null;
//   }

//   const handlePrevious = () => {
//     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
//   };

//   const currentImage = images[currentIndex];

//   // Additional safety check for currentImage
//   if (!currentImage) {
//     return null;
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-sm">
//         <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[500px]">
//           {/* Close button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="absolute top-2 right-2 z-50"
//             onClick={onClose}
//           >
//             <X className="h-4 w-4" />
//           </Button>

//           {/* Navigation buttons - Only show if there's more than one image */}
//           {images.length > 1 && (
//             <>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute left-2 z-50"
//                 onClick={handlePrevious}
//               >
//                 <ChevronLeft className="h-6 w-6" />
//               </Button>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-2 z-50"
//                 onClick={handleNext}
//               >
//                 <ChevronRight className="h-6 w-6" />
//               </Button>
//             </>
//           )}

//           {/* Image */}
//           <div className="relative w-full h-full flex items-center justify-center">
//             <Image
//               src={currentImage.url}
//               alt={currentImage.description || "Equipment image"}
//               fill
//               className="object-contain"
//               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
//             />
//           </div>

//           {/* Image description */}
//           {currentImage.description && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
//               <p className="text-center">{currentImage.description}</p>
//             </div>
//           )}

//           {/* Image counter - Only show if there's more than one image */}
//           {images.length > 1 && (
//             <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
//               {currentIndex + 1} / {images.length}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EquipmentImage } from '@/types/equipment';
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from 'react';

interface ImageModalProps {
  images: EquipmentImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen && initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
      setIsImageLoading(true); // Reset loading state when image changes
    }
  }, [isOpen, initialIndex, images.length]);

  if (!images.length || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  const handlePrevious = () => {
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentIndex];

  if (!currentImage) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-sm">
        <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 z-50"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 z-50"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Loading spinner */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={currentImage.url}
              alt={currentImage.description || "Equipment image"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              onLoadingComplete={() => setIsImageLoading(false)}
              priority
            />
          </div>

          {/* Image description */}
          {currentImage.description && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
              <p className="text-center">{currentImage.description}</p>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}