"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  defaultNumbers: string;
  defaultMoves: string;
  numbers100: string;
  moves100: string;
}

export default function Front({
  defaultNumbers,
  defaultMoves,
  numbers100,
  moves100,
}: Props) {
  const [is100, setIs100] = useState(false);

  const activeNumbers = !is100 ? defaultNumbers : numbers100;
  const activeMoves = !is100 ? defaultMoves : moves100;

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={() => setIs100(!is100)}
        className="px-6 py-2 bg-blue-600 rounded text-white font-bold"
      >
        Test de {is100 ? "10" : "100"} valores
      </button>
      <div className="bg-black text-green-400 p-4 rounded w-full max-w-2xl font-mono">
        <Accordion defaultValue={["numbers"]} className="max-w-lg">
          <AccordionItem value="numbers">
            <AccordionTrigger>Números desordenados</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">{activeNumbers}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="moves">
            <AccordionTrigger>Movimientos calculados</AccordionTrigger>
            <AccordionContent>
              <p>{activeMoves}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
