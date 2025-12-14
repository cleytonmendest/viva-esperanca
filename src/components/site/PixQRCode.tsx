'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { generatePixCode } from '@/lib/pix';

interface PixQRCodeProps {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  description: string;
  amount?: number;
  size?: number;
}

export function PixQRCode({
  pixKey,
  merchantName,
  merchantCity,
  description,
  amount,
  size = 200,
}: PixQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Gera o código PIX EMV
    const pixCode = generatePixCode({
      pixKey,
      merchantName,
      merchantCity,
      description,
      amount,
    });

    // Log para debug (você pode copiar e colar este código no seu banco)
    console.log('Código PIX gerado:', pixCode);
    console.log('Dados PIX:', {
      chave: pixKey,
      nome: merchantName,
      cidade: merchantCity,
      descricao: description,
    });

    // Renderiza o QR Code no canvas
    QRCode.toCanvas(
      canvasRef.current,
      pixCode,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => {
        if (error) {
          console.error('Erro ao gerar QR Code PIX:', error);
        }
      }
    );
  }, [pixKey, merchantName, merchantCity, description, amount, size]);

  return (
    <div className="flex justify-center items-center">
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
}
