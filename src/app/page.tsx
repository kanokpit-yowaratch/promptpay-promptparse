'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { QrCode } from 'lucide-react';
import { ProxyType } from 'promptparse/generate';

declare global {
	interface Window {
		promptparse: {
			generate: {
				anyId: (options: { type: string; target: string; amount?: number }) => string;
			};
			parse: (qrString: string) => {
				getTagValue: (tagId: string) => string;
			};
		};
	}
}

interface QRData {
	type: string;
	payload: string;
	data: { anyId: string; amount: number };
}

export default function PromptPayGenerator() {
	const [isLoaded, setIsLoaded] = useState(false);
	const scriptLoadedRef = useRef(false);
	const [type, setType] = useState<keyof typeof ProxyType>('MSISDN');
	const [promptPayId, setPromptPayId] = useState<string>('');
	const [mobileNo, setMobileNo] = useState<string>('');
	const [amount, setAmount] = useState<number>(10);
	const [qrData, setQrData] = useState<QRData | null>(null);

	const loadPromptparseScript = () => {
		if (scriptLoadedRef.current) return;
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/promptparse';
		script.async = true;
		script.onload = () => {
			scriptLoadedRef.current = true;
			setIsLoaded(true);
		};
		script.onerror = () => {
			console.error('Failed to load PromptParse');
		};
		document.head.appendChild(script);

		return () => {
			document.head.removeChild(script);
		};
	};

	const generatePromptPay = () => {
		if (!isLoaded || typeof window === 'undefined' || !window.promptparse) return;
		try {
			const target = type === 'MSISDN' ? mobileNo : promptPayId;
			const baseOptions = { type, target, amount };
			const payload = window.promptparse.generate.anyId(baseOptions);
			setQrData({ type: 'PromptPay', payload, data: { anyId: target, amount } });
		} catch (error) {
			console.error(error);
		}
	};

	const handleProxyTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;
		setType(value as keyof typeof ProxyType);
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === 'amount') {
			const newAmount = Number(value);
			setAmount(newAmount);
		} else if (name === 'mobileNo') {
			setMobileNo(value);
		} else {
			setPromptPayId(value);
		}
	};

	useEffect(() => {
		loadPromptparseScript();
		const idCard = process.env.NEXT_PUBLIC_ID_CARD ?? '';
		const phone = process.env.NEXT_PUBLIC_MOBILE ?? '';
		setPromptPayId(idCard);
		setMobileNo(phone);
	}, []);

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading PromptParse...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
						<QrCode className="text-blue-600 dark:text-blue-400" size={40} />
						PromptPay QR Generator by promptparse
					</h1>
				</div>

				<div className="grid lg:grid-cols-2 gap-8">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-black/20 p-6 transition-colors">
						<div className="space-y-4">
							<div>
								<label
									htmlFor="amount"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Amount (฿)
								</label>
								<input
									type="number"
									name="amount"
									value={amount}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
									min="0"
									step="0.01"
								/>
							</div>
							<div>
								<label
									htmlFor="proxyType"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Proxy Type
								</label>
								<select
									name="proxyType"
									value={type}
									onChange={handleProxyTypeChange}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
									<option value="MSISDN">Mobile</option>
									<option value="NATID">ID Card</option>
								</select>
							</div>
							{type === 'MSISDN' ? (
								<div>
									<label
										htmlFor="mobileNo"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Phone Number
									</label>
									<input
										type="text"
										name="mobileNo"
										value={mobileNo}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
									/>
								</div>
							) : (
								<div>
									<label
										htmlFor="promptPayId"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										ID Card / PromptPay ID
									</label>
									<input
										type="text"
										name="promptPayId"
										value={promptPayId}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
									/>
								</div>
							)}
							<button
								onClick={generatePromptPay}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95">
								Generate PromptPay QR
							</button>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-black/20 p-6 transition-colors">
						<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
							QR Code Scanner
						</h2>
						{qrData ? (
							<div className="flex flex-col justify-center items-center space-y-1">
								<div className="flex items-center justify-center gap-2">
									<span className="font-medium text-gray-700 dark:text-gray-300">จำนวน:</span>
									<span className="text-lg text-blue-700 dark:text-blue-400 font-bold">
										{amount.toFixed(2)}
									</span>
									<span className="text-gray-700 dark:text-gray-300">฿</span>
								</div>
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 inline-block transition-colors">
									<img
										src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.payload)}&margin=0`}
										alt="Generated QR Code"
										className="rounded-lg shadow-md dark:shadow-black/30"
									/>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
								<QrCode size={64} className="mb-4 opacity-50" />
								<p className="text-sm">Press generate to create QR code</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
