import Icon from '@/app/components/icon';
import { VectorProviderForm } from '@/domains/rag/components/vector-provider-form';

export default function Page() {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex h-[var(--top-bar-height)] bg-mastra-bg-1 sticky top-0 w-full content-center items-center justify-between border-b-[0.1px] border-mastra-border-1 px-[1.31rem]">
        <div className="h-fit items-center  gap-1.5 flex">
          <span className=" bg-mastra-bg-3 rounded h-7 w-7 grid place-items-center">
            <Icon name="agent" className="w-3 h-3" />
          </span>
          <h1 className="text-base">RAG Sync</h1>
        </div>
      </div>
      <section className="flex-1 overflow-scroll space-y-4 p-4">
        <VectorProviderForm />
      </section>
    </div>
  );
}