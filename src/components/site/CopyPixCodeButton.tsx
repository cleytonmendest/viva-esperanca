'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { generatePixCode } from '@/lib/pix';

interface CopyPixCodeButtonProps {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  description: string;
  amount?: number;
}

export function CopyPixCodeButton({
  pixKey,
  merchantName,
  merchantCity,
  description,
  amount,
}: CopyPixCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const pixCode = generatePixCode({
      pixKey,
      merchantName,
      merchantCity,
      description,
      amount,
    });

    await navigator.clipboard.writeText(pixCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copiar código PIX Copia e Cola
        </>
      )}
    </Button>
  );
}
