'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { savePaymentConfig, getPaymentConfig } from '@/app/actions/payment-settings';

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [resendApiKey, setResendApiKey] = useState('');
    const [emailDomain, setEmailDomain] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const config = await getPaymentConfig();
            if (config) {
                setEnabled(config.isEnabled);
                setPublicKey(config.publicKey || '');
                setSecretKey(config.secretKey || ''); // In real app, might mask this
                setResendApiKey(config.resendApiKey || '');
                setEmailDomain(config.emailDomain || '');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payment settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await savePaymentConfig({
                isEnabled: enabled,
                publicKey,
                secretKey,
                resendApiKey,
                emailDomain,
            });
            toast.success('Payment settings saved successfully');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h3 className="text-lg font-medium">Payment Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure your Paystack keys to receive payments directly.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Paystack Configuration
                    </CardTitle>
                    <CardDescription>
                        Enter your Paystack API keys. You can find these in your Paystack Dashboard under Settings {'>'} API Keys.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                        <div className="space-y-0.5">
                            <Label>Enable Paystack Payments</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow attendees to pay via Paystack.
                            </p>
                        </div>
                        <Switch
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pk">Public Key</Label>
                        <Input
                            id="pk"
                            placeholder="pk_live_..."
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sk">Secret Key</Label>
                        <Input
                            id="sk"
                            type="password"
                            placeholder="sk_live_..."
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Email Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure your Resend API key to send ticket emails. Get your key from {''}
                        <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            resend.com/api-keys
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="resend">Resend API Key</Label>
                        <Input
                            id="resend"
                            type="password"
                            placeholder="re_..."
                            value={resendApiKey}
                            onChange={(e) => setResendApiKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Your API key is encrypted and only used to send ticket emails to your customers.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emailDomain">Email Domain</Label>
                        <Input
                            id="emailDomain"
                            placeholder="yourdomain.com"
                            value={emailDomain}
                            onChange={(e) => setEmailDomain(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The domain used in the &apos;from&apos; address of emails. Example: tickets@yourdomain.com. Must be a verified domain in Resend.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
