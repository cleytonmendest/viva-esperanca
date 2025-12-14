/**
 * Gerador de código PIX no padrão EMV do Banco Central do Brasil
 */

interface PixData {
  pixKey: string;
  description: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
}

/**
 * Remove acentos e caracteres especiais de uma string
 */
function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase();
}

/**
 * Remove formatação de CNPJ/CPF (mantém apenas números)
 */
function cleanDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

/**
 * Adiciona padding de zeros à esquerda
 */
function pad(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}

/**
 * Cria um campo EMV no formato ID + LENGTH + VALUE
 */
function createEMVField(id: string, value: string): string {
  const length = pad(value.length, 2);
  return `${id}${length}${value}`;
}

/**
 * Gera o código PIX EMV (Copia e Cola) válido
 */
export function generatePixCode(data: PixData): string {
  const {
    pixKey,
    description,
    merchantName,
    merchantCity,
    amount,
    txid = '***',
  } = data;

  // Limpar e validar dados
  const cleanPixKey = cleanDocument(pixKey);
  const cleanMerchantName = removeAccents(merchantName).substring(0, 25); // Max 25 caracteres
  const cleanMerchantCity = removeAccents(merchantCity).substring(0, 15); // Max 15 caracteres
  const cleanDescription = description ? removeAccents(description).substring(0, 25) : '';

  // 00: Payload Format Indicator
  let pix = createEMVField('00', '01');

  // 26: Merchant Account Information
  const merchantAccountInfo =
    createEMVField('00', 'BR.GOV.BCB.PIX') + // GUI
    createEMVField('01', cleanPixKey) + // Chave PIX (sem formatação)
    (cleanDescription ? createEMVField('02', cleanDescription) : ''); // Descrição (opcional)

  pix += createEMVField('26', merchantAccountInfo);

  // 52: Merchant Category Code (0000 = não especificado)
  pix += createEMVField('52', '0000');

  // 53: Transaction Currency (986 = BRL - Real Brasileiro)
  pix += createEMVField('53', '986');

  // 54: Transaction Amount (opcional)
  if (amount && amount > 0) {
    pix += createEMVField('54', amount.toFixed(2));
  }

  // 58: Country Code
  pix += createEMVField('58', 'BR');

  // 59: Merchant Name
  pix += createEMVField('59', cleanMerchantName);

  // 60: Merchant City
  pix += createEMVField('60', cleanMerchantCity);

  // 62: Additional Data Field Template
  const additionalDataField = createEMVField('05', txid); // Transaction ID
  pix += createEMVField('62', additionalDataField);

  // 63: CRC16 (calculado ao final)
  pix += '6304';

  // Calcula CRC16-CCITT
  const crc = calculateCRC16(pix);
  pix += crc;

  return pix;
}

/**
 * Calcula o CRC16-CCITT do código PIX
 * Polinômio: 0x1021
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
