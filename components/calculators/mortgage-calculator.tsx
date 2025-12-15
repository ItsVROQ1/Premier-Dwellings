'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Calculator, Home } from 'lucide-react';

const PAKISTANI_BANKS = [
  { name: 'HBL', rate: 18.5 },
  { name: 'UBL', rate: 18.0 },
  { name: 'MCB', rate: 17.5 },
  { name: 'Allied Bank', rate: 18.2 },
  { name: 'Meezan Bank', rate: 17.8 },
  { name: 'Bank Alfalah', rate: 18.3 },
  { name: 'Faysal Bank', rate: 18.0 },
  { name: 'Standard Chartered', rate: 17.9 },
];

export function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(10000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTenure, setLoanTenure] = useState<number>(20);
  const [selectedBank, setSelectedBank] = useState(PAKISTANI_BANKS[0]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(200000);
  
  const [results, setResults] = useState({
    downPayment: 0,
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    eligible: false,
    maxLoanAmount: 0,
  });

  useEffect(() => {
    calculateMortgage();
  }, [propertyPrice, downPaymentPercent, loanTenure, selectedBank, monthlyIncome]);

  const calculateMortgage = () => {
    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;
    
    const monthlyRate = selectedBank.rate / 100 / 12;
    const numberOfPayments = loanTenure * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;
    
    const maxMonthlyPayment = monthlyIncome * 0.40;
    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
                          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    
    const eligible = monthlyPayment <= maxMonthlyPayment;

    setResults({
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      eligible,
      maxLoanAmount,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Calculator
          </CardTitle>
          <CardDescription>
            Calculate your monthly mortgage payment with Pakistani bank rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="propertyPrice">Property Price (PKR)</Label>
            <Input
              id="propertyPrice"
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              min={0}
            />
          </div>

          <div>
            <Label htmlFor="downPayment">Down Payment (%)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              min={10}
              max={100}
            />
          </div>

          <div>
            <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
            <Input
              id="loanTenure"
              type="number"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              min={1}
              max={30}
            />
          </div>

          <div>
            <Label htmlFor="bank">Select Bank</Label>
            <select
              id="bank"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedBank.name}
              onChange={(e) => {
                const bank = PAKISTANI_BANKS.find(b => b.name === e.target.value);
                if (bank) setSelectedBank(bank);
              }}
            >
              {PAKISTANI_BANKS.map((bank) => (
                <option key={bank.name} value={bank.name}>
                  {bank.name} - {bank.rate}% per annum
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (PKR)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              min={0}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Loan Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Down Payment</span>
              <span className="text-sm font-bold">{formatCurrency(results.downPayment)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Loan Amount</span>
              <span className="text-sm font-bold">{formatCurrency(results.loanAmount)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Monthly Payment</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(results.monthlyPayment)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Total Payment</span>
              <span className="text-sm font-bold">{formatCurrency(results.totalPayment)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Total Interest</span>
              <span className="text-sm font-bold">{formatCurrency(results.totalInterest)}</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${results.eligible ? 'bg-success/10' : 'bg-danger/10'}`}>
            <div className="font-semibold mb-2">
              {results.eligible ? 'Eligible for Loan' : 'Not Eligible'}
            </div>
            <div className="text-sm text-muted-foreground">
              {results.eligible ? (
                <span>
                  Your monthly payment is {((results.monthlyPayment / monthlyIncome) * 100).toFixed(1)}% 
                  of your income (should be ≤40%)
                </span>
              ) : (
                <span>
                  Your maximum loan amount is {formatCurrency(results.maxLoanAmount)} based on your income
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Interest rate: {selectedBank.rate}% per annum</p>
            <p>• Loan tenure: {loanTenure} years ({loanTenure * 12} months)</p>
            <p>• Calculation based on reducing balance method</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
