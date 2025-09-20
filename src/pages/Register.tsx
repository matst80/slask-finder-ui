import { useState } from "react";
import { useWebAuthn } from "../components/useWebAuthn";
import { useUser } from "../adminHooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { KeyRound, Shield, UserCheck, AlertCircle, CheckCircle } from "lucide-react";

export default function Register() {    
    const { initiateRegistration, isSupported } = useWebAuthn();
    const { data: user, isLoading: userLoading } = useUser();
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const isLoggedIn = user?.role != null;
    const canRegister = isLoggedIn && isSupported;
    
    const handleRegister = async () => {
        if (!canRegister) return;
        
        setIsRegistering(true);
        setRegistrationStatus('idle');
        setErrorMessage('');
        
        try {
            const result = await initiateRegistration();
            if (result.ok) {
                setRegistrationStatus('success');
            } else {
                setRegistrationStatus('error');
                setErrorMessage('Registration failed. Please try again.');
            }
        } catch (error) {
            setRegistrationStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-xl">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                        <KeyRound className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        WebAuthn Registration
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Register your biometric authentication for secure access
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 p-6">
                    {/* WebAuthn Support Status */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                WebAuthn Support
                            </p>
                            <p className="text-xs text-gray-600 break-words">
                                {isSupported ? "✅ Supported" : "❌ Not supported"}
                            </p>
                        </div>
                    </div>
                    
                    {/* User Status */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <UserCheck className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Authentication Status
                            </p>
                            <p className="text-xs text-gray-600 break-words">
                                {userLoading ? "Checking..." : isLoggedIn ? `✅ Logged in as ${user?.name || 'User'}` : "❌ Not logged in"}
                            </p>
                        </div>
                    </div>
                    
                    {/* Success Message */}
                    {registrationStatus === 'success' && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-900">
                                    Registration Successful!
                                </p>
                                <p className="text-xs text-green-700 break-words">
                                    Your biometric authentication has been registered.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {registrationStatus === 'error' && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-900">
                                    Registration Failed
                                </p>
                                <p className="text-xs text-red-700 break-words">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Requirements */}
                    {!canRegister && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900">Requirements:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                {!isLoggedIn && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        <a href="/admin/login" className="underline">Please log in to your google account first</a>.
                                    </li>
                                )}
                                {!isSupported && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        Your browser doesn't support WebAuthn
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </CardContent>
                
                <CardFooter className="pt-4">
                    <Button
                        onClick={handleRegister}
                        disabled={!canRegister || isRegistering || userLoading}
                        className="w-full flex gap-2 items-center"
                        variant={canRegister ? "default" : "secondary"}
                    >
                        {isRegistering ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Registering...
                            </>
                        ) : (
                            <>
                                <KeyRound className="w-4 h-4" />
                                {canRegister ? "Register Biometric Auth" : "Cannot Register"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}