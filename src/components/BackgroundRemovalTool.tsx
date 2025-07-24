import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';

const BackgroundRemovalTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const productImages = [
    {
      name: "IV Stand",
      originalUrl: "/lovable-uploads/bee7aa89-8d50-49af-867f-7cbdd9c2792f.png",
      processedUrl: null
    },
    {
      name: "Privacy Screen", 
      originalUrl: "/lovable-uploads/cd28c6a2-9f50-475f-9208-389d15ccadd8.png",
      processedUrl: null
    },
    {
      name: "Sterilization Basket",
      originalUrl: "/lovable-uploads/72be7c9a-2668-4d3c-ac69-7ab9f8696a50.png", 
      processedUrl: null
    },
    {
      name: "Step Stand",
      originalUrl: "/lovable-uploads/aa47f9a4-8429-46f0-a4f8-5faca2f08cc9.png",
      processedUrl: null
    },
    {
      name: "Medical Cart",
      originalUrl: "/lovable-uploads/df0b7c5a-6081-4dd8-93f1-bfad03e1543c.png",
      processedUrl: null
    },
    {
      name: "Operating Table",
      originalUrl: "/lovable-uploads/7c3b22d1-fad7-488b-85b5-20d47a7c10bd.png",
      processedUrl: null
    }
  ];

  const [processedImages, setProcessedImages] = useState(productImages);

  const processAllImages = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const totalImages = productImages.length;
      const newProcessedImages = [...processedImages];

      for (let i = 0; i < totalImages; i++) {
        const image = productImages[i];
        
        try {
          console.log(`Processing ${image.name}...`);
          
          // Load the image
          const imageElement = await loadImageFromUrl(image.originalUrl);
          
          // Remove background
          const processedBlob = await removeBackground(imageElement);
          
          // Create a URL for the processed image
          const processedUrl = URL.createObjectURL(processedBlob);
          newProcessedImages[i].processedUrl = processedUrl;
          
          setProcessedImages([...newProcessedImages]);
          setProgress(((i + 1) / totalImages) * 100);
          
          console.log(`Successfully processed ${image.name}`);
          
        } catch (error) {
          console.error(`Failed to process ${image.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${image.name}`,
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Processing Complete",
        description: "All images have been processed successfully!"
      });
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-transparent.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Background Removal Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button 
                onClick={processAllImages} 
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Remove Backgrounds from All Images'}
              </Button>
              
              {isProcessing && (
                <div className="w-1/3">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground mt-1">
                    Processing: {Math.round(progress)}%
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedImages.map((image, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{image.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Original Image */}
                      <div>
                        <p className="text-sm font-medium mb-2">Original:</p>
                        <img
                          src={image.originalUrl}
                          alt={`Original ${image.name}`}
                          className="w-full h-32 object-contain bg-gray-100 rounded"
                        />
                      </div>
                      
                      {/* Processed Image */}
                      {image.processedUrl && (
                        <div>
                          <p className="text-sm font-medium mb-2">Transparent:</p>
                          <div className="relative">
                            <img
                              src={image.processedUrl}
                              alt={`Processed ${image.name}`}
                              className="w-full h-32 object-contain rounded"
                              style={{
                                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                              }}
                            />
                          </div>
                          <Button
                            onClick={() => downloadImage(image.processedUrl!, image.name)}
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                          >
                            Download PNG
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundRemovalTool;