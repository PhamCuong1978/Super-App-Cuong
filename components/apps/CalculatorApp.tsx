
import React, { useState } from 'react';
import AppContainer from '../AppContainer';
import { User } from '../../types';

interface CalculatorAppProps {
  onExit: () => void;
  isVisible: boolean;
  user?: User | null;
}

const CalculatorApp: React.FC<CalculatorAppProps> = ({ onExit, isVisible, user }) => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (operator && !waitingForSecondOperand) {
      if (firstOperand === null) {
        setFirstOperand(inputValue);
      } else {
        const result = calculate(firstOperand, inputValue, operator);
        setDisplay(String(result));
        setFirstOperand(result);
      }
    } else {
      setFirstOperand(inputValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second;
      default: return second;
    }
  };
  
  const handleEquals = () => {
    if (operator && firstOperand !== null) {
      const secondOperand = parseFloat(display);
      const result = calculate(firstOperand, secondOperand, operator);
      setDisplay(String(result));
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const buttons = [
    'C', '±', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ];
  
  const getButtonClass = (btn: string) => {
      const isOperator = ['/', '*', '-', '+', '='].includes(btn);
      const isTopRow = ['C', '±', '%'].includes(btn);
      if (isOperator) return "bg-orange-500 hover:bg-orange-600";
      if (isTopRow) return "bg-slate-500 hover:bg-slate-600";
      return "bg-slate-700 hover:bg-slate-600";
  };
  
  const handleButtonClick = (btn: string) => {
      if (!isNaN(parseInt(btn)) || btn === '.') {
          handleDigitClick(btn);
      } else if (['/', '*', '-', '+'].includes(btn)) {
          handleOperatorClick(btn);
      } else if (btn === '=') {
          handleEquals();
      } else if (btn === 'C') {
          handleClear();
      }
      // ignoring ± and % for simplicity
  };

  return (
    <AppContainer appName="Kế toán Online" onExit={onExit} isVisible={isVisible} user={user}>
      <div className="flex justify-center items-center flex-grow">
        <div className="w-full max-w-xs bg-slate-800 rounded-2xl shadow-2xl p-4">
          <div className="bg-slate-900 text-white text-5xl text-right font-light rounded-lg p-4 mb-4 break-all">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn) => (
                <button
                    key={btn}
                    onClick={() => handleButtonClick(btn)}
                    className={`text-2xl font-semibold rounded-lg h-16 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${getButtonClass(btn)} ${btn === '0' ? 'col-span-2' : ''}`}
                >
                    {btn}
                </button>
            ))}
          </div>
        </div>
      </div>
    </AppContainer>
  );
};

export default CalculatorApp;
