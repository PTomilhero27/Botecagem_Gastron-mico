"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { TitleModal } from "./components/TitleModal";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ContractBlock, BlockType } from "./components/types";
import { EmptyInstructions } from "./components/clause/EmptyInstructions";
import { ContractBlocksList } from "./components/clause/ContractBlocksList";
import { CreateClauseModal } from "./components/clause/create/CreateClauseModal";
import { CreateTextModal } from "./components/clause/create/CreateTextModal";
import { ContractPreviewModal } from "./components/preview/ContractPreviewModal";
import { FloatingDock } from "../[id]/components/FloatingDock";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewDocumentTemplatePage() {
    const router = useRouter();

    const [title, setTitle] = useState<string | null>(null);
    const [blocks, setBlocks] = useState<ContractBlock[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false)
    const [configOpen, setConfigOpen] = useState(false);
    const [hasRegistration, setHasRegistration] = useState(false);

    const [createClauseOpen, setCreateClauseOpen] = useState(false);
    const [createTextOpen, setCreateTextOpen] = useState(false);

    const nextClauseNo = useMemo(() => {
        return blocks.filter((b) => b.type === "clause").length + 1;
    }, [blocks]);

    function onAdd(type: BlockType) {
        if (type === "clause") setCreateClauseOpen(true);
        if (type === "text") setCreateTextOpen(true);
    }

    function addClause(payload: { title: string; text: string }) {
        setBlocks((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                type: "clause",
                clauseNo: nextClauseNo,
                title: payload.title,
                text: payload.text,
                incisos: [],
            } as any,
        ]);
        setCreateClauseOpen(false);
    }

    function addText(payload: { text: string }) {
        setBlocks((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "text", text: payload.text },
        ]);
        setCreateTextOpen(false);
    }

    async function saveContract() {
        if (!title) return;

        setSaving(true);

        const { data } = await supabase
            .from("document_templates")
            .insert({ title, status: "draft" })
            .select("id")
            .single();

        if (data) {
            await supabase.from("document_template_versions").insert({
                template_id: data.id,
                version_number: 1,
                content: JSON.stringify(blocks),
            });
        }

        router.push("/pages/document-templates");
    }

    return (
        <main className="mx-auto max-w-5xl p-6 space-y-6">
            <TitleModal open={title === null} onSave={setTitle} />

            <Breadcrumbs
                items={[
                    { label: "Home", href: "/pages/home" },
                    { label: "Contratos", href: "/pages/document-templates" },
                    { label: "Criar novo contrato" },
                ]}
            />

            {title && (
                <>
                    <h1 className="text-2xl font-bold">{title}</h1>

                    {blocks.length === 0 ? (
                        <EmptyInstructions />
                    ) : (
                        <ContractBlocksList blocks={blocks} setBlocks={setBlocks} />
                    )}

                    <CreateClauseModal
                        open={createClauseOpen}
                        clauseNo={nextClauseNo}
                        onClose={() => setCreateClauseOpen(false)}
                        onSave={addClause}
                    />

                    <CreateTextModal
                        open={createTextOpen}
                        onClose={() => setCreateTextOpen(false)}
                        onSave={addText}
                    />

                    <ContractPreviewModal
                        open={previewOpen}
                        onClose={() => setPreviewOpen(false)}
                        title={title}
                        blocks={blocks}
                    />

                    <FloatingDock

                        addOpen={menuOpen}
                        setAddOpen={setMenuOpen}
                        onAdd={(type) => {
                            setMenuOpen(false);
                            onAdd(type);
                        }}
                        configOpen={configOpen}
                        setConfigOpen={setConfigOpen}
                        onPreview={() => setPreviewOpen(true)}
                        onSaveDraft={saveContract}

                        hasRegistration={hasRegistration}
                        onToggleRegistration={() => setHasRegistration((v) => !v)}
                    />


                </>
            )}
        </main>
    );
}
