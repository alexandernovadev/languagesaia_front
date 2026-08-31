import { useRef, useState } from 'react';

type OperationKey = 'words' | 'expressions' | 'lectures' | 'exams' | 'stories';

interface DangerousOperationState {
  pendingOperation: OperationKey | null;
  showFirstConfirm: boolean;
  showSecondConfirm: boolean;
  operationLoading: boolean;
  operationLabel: string;
  trigger: (operation: OperationKey) => void;
  handleFirstConfirm: () => void;
  handleSecondConfirm: () => Promise<void>;
  handleCancel: () => void;
  /** Para AlertDialog `onOpenChange` — no llama handleCancel al pasar al segundo paso */
  handleFirstOpenChange: (open: boolean) => void;
  handleSecondOpenChange: (open: boolean) => void;
}

const LABELS: Record<OperationKey, string> = {
  words: 'palabras',
  expressions: 'expresiones',
  lectures: 'lecturas',
  exams: 'exámenes',
  stories: 'historias',
};

export function useDangerousOperation(
  handlers: Record<OperationKey, () => Promise<void>>
): DangerousOperationState {
  const [pendingOperation, setPendingOperation] = useState<OperationKey | null>(null);
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  /** Evita handleCancel cuando el 1er diálogo se cierra al avanzar al 2º */
  const advancingToSecondRef = useRef(false);

  const trigger = (operation: OperationKey) => {
    setPendingOperation(operation);
    setShowFirstConfirm(true);
  };

  const handleFirstConfirm = () => {
    advancingToSecondRef.current = true;
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleSecondConfirm = async () => {
    if (!pendingOperation) return;
    setOperationLoading(true);
    try {
      await handlers[pendingOperation]();
      setShowSecondConfirm(false);
      setPendingOperation(null);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancel = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(false);
    setPendingOperation(null);
    setOperationLoading(false);
  };

  const handleFirstOpenChange = (open: boolean) => {
    setShowFirstConfirm(open);
    if (!open) {
      if (advancingToSecondRef.current) {
        setTimeout(() => {
          advancingToSecondRef.current = false;
        }, 0);
      } else {
        handleCancel();
      }
    }
  };

  const handleSecondOpenChange = (open: boolean) => {
    setShowSecondConfirm(open);
    if (!open) {
      handleCancel();
    }
  };

  return {
    pendingOperation,
    showFirstConfirm,
    showSecondConfirm,
    operationLoading,
    operationLabel: pendingOperation ? LABELS[pendingOperation] : '',
    trigger,
    handleFirstConfirm,
    handleSecondConfirm,
    handleCancel,
    handleFirstOpenChange,
    handleSecondOpenChange,
  };
}
