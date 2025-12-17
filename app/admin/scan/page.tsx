'use client';

import { useState } from 'react';
import QRScanner from '@/components/admin/qr-scanner';
import { validateTicket, redeemTicket, TicketValidationResult } from '@/app/actions/ticket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<TicketValidationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');

    const handleScan = async (token: string) => {
        setIsScanning(false);
        setLoading(true);
        try {
            const result = await validateTicket(token);
            setScanResult(result);
            if (result.valid) {
                // Auto-redeem for smoother flow? Or ask for confirmation?
                // PRD FR-15: "On success... updates ticket status to USED" -> Implies auto-redeem or immediate action.
                // Let's validate first, then redeem.
                await redeemTicket(result.ticket!.id);
            }
        } catch {
            toast.error('Failed to validate ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScan(manualCode.trim());
        }
    };

    const resetScan = () => {
        setScanResult(null);
        setManualCode('');
        setIsScanning(true);
    };

    return (
        <div className="container mx-auto max-w-md p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center">Ticket Scanner</h1>

            {!scanResult && !loading && (
                <>
                    {isScanning ? (
                        <div className="space-y-4">
                            <QRScanner onScan={handleScan} />
                            <Button variant="outline" className="w-full" onClick={() => setIsScanning(false)}>
                                Stop Scanning
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <Button
                                size="lg"
                                className="w-full h-32 text-xl"
                                onClick={() => setIsScanning(true)}
                            >
                                Tap to Scan
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                                </div>
                            </div>

                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <Input
                                    placeholder="Enter Ticket Token"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                />
                                <Button type="submit">Check</Button>
                            </form>
                        </div>
                    )}
                </>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p>Validating Ticket...</p>
                </div>
            )}

            {scanResult && (
                <Card className={scanResult.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {scanResult.valid ? (
                                <CheckCircle2 className="text-green-600 h-8 w-8" />
                            ) : (
                                <XCircle className="text-red-600 h-8 w-8" />
                            )}
                            <span className={scanResult.valid ? 'text-green-700' : 'text-red-700'}>
                                {scanResult.message}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    {scanResult.ticket && (
                        <CardContent className="space-y-2">
                            <p className="font-semibold">{scanResult.ticket.event.title}</p>
                            <p className="text-sm text-slate-600">Attendee: {scanResult.ticket.user.name || 'Guest'}</p>
                            <p className="text-sm text-slate-500">{scanResult.ticket.user.email}</p>
                            <div className="text-xs text-slate-400 font-mono mt-2">{scanResult.ticket.id}</div>
                        </CardContent>
                    )}
                    <div className="p-4 pt-0">
                        <Button className="w-full" onClick={resetScan}>Scan Next</Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
