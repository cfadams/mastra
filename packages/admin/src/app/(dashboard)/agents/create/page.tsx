import { Icon } from '@/app/components/icon';
import { AgentsCreationHeader } from '@/domains/agents/components/agents-creation-header';
import { AgentTools } from '@/domains/agents/components/agents-integrations';

export default function Page() {
  return (
    <div className="overflow-y-scroll">
      <div className="flex h-[var(--top-bar-height)] bg-mastra-bg-1 sticky top-0 w-full content-center items-center justify-between border-b-[0.1px] border-mastra-border-1 px-[1.31rem]">
        <div className="h-fit items-center  gap-1.5 flex">
          <span className=" bg-mastra-bg-3 rounded h-7 w-7 grid place-items-center">
            <Icon name="agent" className="w-3 h-3" />
          </span>
          <h1 className="text-base">Create New Agent</h1>
        </div>
      </div>
      <section className="grid h-[calc(100%-1.24rem)] gap-x-[0.62rem] grid-cols-[30rem_1fr]">
        <div>
          <AgentsCreationHeader />
          <AgentTools />
        </div>
        <div className="px-[1.31rem] py-4">Agent Preview</div>
      </section>
    </div>
  );
}