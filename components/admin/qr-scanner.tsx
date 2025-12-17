'use client';

import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
    onScan: (text: string) => void;
    onError?: (error: unknown) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    return (
        <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm bg-black">
            <Scanner
                onScan={(result) => {
                    if (result && result[0] && result[0].rawValue) {
                        onScan(result[0].rawValue);
                    }
                }}
                onError={(error) => {
                    if (onError) onError(error);
                }}
                components={{
                    onOff: true,
                    torch: true,
                    zoom: true
                }}
                styles={{
                    container: {
                        width: '100%',
                        maxWidth: '500px',
                        aspectRatio: '1/1',
                        margin: '0 auto'
                    }
                }}
            />
        </div>
    );
}
