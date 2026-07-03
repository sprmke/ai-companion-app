import { Suspense } from 'react';
import WorkspaceShell from '@/app/(main)/workspace/_components/WorkspaceShell';
import { PaymentSuccessModal } from '@/app/(main)/workspace/_components/PaymentSuccessModal';

export default function Workspace() {
  return (
    <>
      <WorkspaceShell />
      <Suspense>
        <PaymentSuccessModal />
      </Suspense>
    </>
  );
}
