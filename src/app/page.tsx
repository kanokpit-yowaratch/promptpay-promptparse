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
	// const [proxyType, setProxyType] = useState<ProxyType>(ProxyType.NATID);
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
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading PromptParse...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
						<QrCode className="text-blue-600" size={40} />
						PromptPay QR Generator by promptparse
					</h1>
				</div>

				<div className="grid lg:grid-cols-2 gap-8">
					<div className="bg-white rounded-2xl shadow-xl p-6">
						<div className="space-y-4">
							<div>
								<label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
									Amount (฿)
								</label>
								<input
									type="number"
									name="amount"
									value={amount}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									min="0"
									step="0.01"
								/>
							</div>
							<div>
								<label htmlFor="proxyType" className="block text-sm font-medium text-gray-700 mb-2">
									Amount (฿)
								</label>
								<select name="proxyType" value={type} onChange={handleProxyTypeChange}>
									<option value="MSISDN">Mobile</option>
									<option value="NATID">ID Card</option>
								</select>
							</div>
							{type === 'MSISDN' ? (
								<div>
									<label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-2">
										Phone Number
									</label>
									<input
										type="text"
										name="mobileNo"
										value={mobileNo}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									/>
								</div>
							) : (
								<div>
									<label htmlFor="promptPayId" className="block text-sm font-medium text-gray-700 mb-2">
										ID Card / Promppay ID
									</label>
									<input
										type="text"
										name="promptPayId"
										value={promptPayId}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									/>
								</div>
							)}
							<button
                onClick={generatePromptPay}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95"
              >
                Generate PromptPay QR
              </button>
						</div>
					</div>

					<div className="bg-white rounded-2xl shadow-xl p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-2 text-center">QR Code Scanner</h2>
						{qrData && (
							<div className="flex flex-col justify-center items-center space-y-1">
								{/* <div><span className="font-medium">Type:</span> {qrData.type}</div> */}
								<div className="flex items-center justify-center gap-2">
									<span className="font-medium">จำนวน:</span>
									<span className="text-lg text-blue-700 font-bold">{amount.toFixed(2)}</span>
									<span>฿</span>
								</div>
								<div className="bg-gray-50 rounded-xl p-6 inline-block">
									<img
										src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.payload)}&margin=0`}
										alt="Generated QR Code"
										className="rounded-lg shadow-md"
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
