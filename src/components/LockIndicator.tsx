interface LockIndicatorProps {
  lockHolder: string | null;
  isLocked: boolean;
}

export default function LockIndicator({ lockHolder, isLocked }: LockIndicatorProps) {
  if (!isLocked || !lockHolder) return null;

  return (
    <div className="lock-indicator">
      Locked by: {lockHolder}
    </div>
  );
}
