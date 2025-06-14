import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Bitcoin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

interface CalculationResult {
  initialInvestment: number;
  currency: string;
  year: number;
  btcPriceAtTime: number;
  btcBought: number;
  currentBtcPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

const Index = () => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const { toast } = useToast();

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: '₹'
  };

  // Generate years from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => 2010 + i);

  const fetchCurrentBitcoinPrice = async (currency: string) => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`
    );
    const data = await response.json();
    return data.bitcoin[currency.toLowerCase()];
  };

  const fetchHistoricalBitcoinPrice = async (year: number, currency: string) => {
    // Using January 1st of the selected year
    const date = `01-01-${year}`;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${date}`
    );
    const data = await response.json();
    
    // Get the price in the specified currency
    const currencyKey = currency.toLowerCase();
    if (data.market_data && data.market_data.current_price && data.market_data.current_price[currencyKey]) {
      return data.market_data.current_price[currencyKey];
    }
    
    // Fallback: use approximate historical prices for early years
    const approximatePrices: { [key: string]: { [year: number]: number } } = {
      usd: {
        2010: 0.003, 2011: 0.30, 2012: 5.27, 2013: 13.28, 2014: 320.19,
        2015: 314.93, 2016: 998.33, 2017: 13880, 2018: 3693, 2019: 7179,
        2020: 28949, 2021: 46498, 2022: 47686, 2023: 16625, 2024: 42280
      },
      eur: {
        2010: 0.002, 2011: 0.22, 2012: 4.01, 2013: 9.98, 2014: 260.15,
        2015: 287.50, 2016: 948.75, 2017: 11662, 2018: 3244, 2019: 6441,
        2020: 23918, 2021: 38173, 2022: 43918, 2023: 15281, 2024: 38956
      },
      inr: {
        2010: 0.14, 2011: 13.5, 2012: 293, 2013: 830, 2014: 19700,
        2015: 20645, 2016: 67840, 2017: 897000, 2018: 264000, 2019: 508000,
        2020: 2146000, 2021: 3457000, 2022: 3935000, 2023: 1375000, 2024: 3500000
      }
    };
    
    return approximatePrices[currencyKey][year] || 100;
  };

  const calculateInvestment = async () => {
    if (!investmentAmount || !selectedYear || !selectedCurrency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to calculate your investment.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      const investment = parseFloat(investmentAmount);
      const year = parseInt(selectedYear);
      
      // Fetch current and historical Bitcoin prices
      const [currentPrice, historicalPrice] = await Promise.all([
        fetchCurrentBitcoinPrice(selectedCurrency),
        fetchHistoricalBitcoinPrice(year, selectedCurrency)
      ]);

      // Calculate how much BTC was bought
      const btcBought = investment / historicalPrice;
      
      // Calculate current value
      const currentValue = btcBought * currentPrice;
      
      // Calculate profit/loss
      const profitLoss = currentValue - investment;
      const profitLossPercentage = (profitLoss / investment) * 100;

      const calculationResult: CalculationResult = {
        initialInvestment: investment,
        currency: selectedCurrency,
        year,
        btcPriceAtTime: historicalPrice,
        btcBought,
        currentBtcPrice: currentPrice,
        currentValue,
        profitLoss,
        profitLossPercentage
      };

      setResult(calculationResult);
      
      toast({
        title: "Calculation Complete!",
        description: `Your ${currencySymbols[selectedCurrency as keyof typeof currencySymbols]}${investment} investment would be worth ${currencySymbols[selectedCurrency as keyof typeof currencySymbols]}${currentValue.toLocaleString()} today!`,
      });

    } catch (error) {
      console.error('Error calculating investment:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to fetch Bitcoin prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols];
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatBTC = (amount: number) => {
    return `${amount.toFixed(8)} BTC`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Bitcoin className="h-12 w-12 text-orange-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Bitcoin Investment Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover what your Bitcoin investment would be worth today. Calculate potential returns from any year since 2010.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Calculator className="h-5 w-5 mr-2 text-orange-500" />
                Investment Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your investment amount and year to see potential returns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Amount</label>
                <div className="flex gap-2">
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculateInvestment} 
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {isCalculating ? "Calculating..." : "Calculate Investment"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  {result.profitLoss >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  Investment Results
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your Bitcoin investment performance from {result.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Initial Investment</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(result.initialInvestment, result.currency)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">BTC Purchased</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatBTC(result.btcBought)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">BTC Price ({result.year})</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(result.btcPriceAtTime, result.currency)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">BTC Price (Today)</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(result.currentBtcPrice, result.currency)}</p>
                  </div>
                </div>

                <div className="border-t dark:border-gray-600 pt-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(result.currentValue, result.currency)}
                    </p>
                  </div>
                  
                  <div className={`mt-3 p-4 rounded-lg ${
                    result.profitLoss >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {result.profitLoss >= 0 ? 'Profit' : 'Loss'}
                    </p>
                    <p className={`text-xl font-bold ${
                      result.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(result.profitLoss), result.currency)}
                    </p>
                    <p className={`text-sm ${
                      result.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.profitLossPercentage > 0 ? '+' : ''}{result.profitLossPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!result && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Bitcoin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter your investment details to see the magic happen!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> This calculator uses historical data and current prices for educational purposes. 
            Past performance does not guarantee future results. Always do your own research before investing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
