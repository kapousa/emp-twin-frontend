// src/components/PersonaCard.tsx (Updated)

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  BookOpen, // Not used, but kept for context
  Trash2,
  Eye,
  Loader2,
  FilePlus,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface Persona {
  id: string;
  persona_name: string;
  persona_role: string;
  avatar_url: string | null;
  status: 'queued' | 'processing' | 'ready' | 'failed';
}

interface PersonaCardProps {
  persona: Persona;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  // onViewDetails prop is now removed
}

const PersonaCard = ({ persona, onDelete, isDeleting }: PersonaCardProps) => {
  const { t } = useTranslation();

  const numberOfStaticAvatars = 5;
  const basePlaceholderName = "/user-placeholder-";

  const getDynamicAvatarIndex = (id: string, totalAvatars: number): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % totalAvatars) + 1;
  };

  const dynamicAvatarIndex = getDynamicAvatarIndex(persona.id, numberOfStaticAvatars);
  const dynamicStaticAvatarSrc = `${basePlaceholderName}${dynamicAvatarIndex}.png`;

  const getStatusDisplay = (status: Persona['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t("persona_card.status.active")}</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">{t("persona_card.status.processing")}</Badge>;
      case 'queued':
        return <Badge variant="secondary">{t("persona_card.status.queued")}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{t("persona_card.status.failed")}</Badge>;
      default:
        return <Badge variant="secondary">{t("persona_card.status.unknown")}</Badge>;
    }
  };

  const isActionDisabled = isDeleting || persona.status !== 'ready';

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow text-center">
      <CardHeader className="pt-8 pb-4 flex items-center justify-center">
        <div className="relative p-2 bg-gradient-to-br from-background to-secondary rounded-lg shadow-md">
          <img
            src={persona.avatar_url || dynamicStaticAvatarSrc}
            alt={`${persona.personaName}'s avatar`}
            className="w-28 h-28 object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-avatar.png";
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 flex flex-col items-center">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{persona.persona_name}</CardTitle>
          <CardDescription className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Brain className="h-4 w-4" />
            <span>{persona.persona_tone}</span>
            <span>{persona.persona_role}</span>
          </CardDescription>
        </div>
        <div className="mt-3">
            {getStatusDisplay(persona.status)}
        </div>
      </CardContent>

      <CardContent className="pt-4 border-t flex-1 flex flex-col justify-end">
        <div className="grid grid-cols-2 gap-3">

          {/* 1. See Details -> Now links to the edit page */}
          <Link to={`/persona/${persona.id}/details`}> {/* <<< CHANGED ROUTE */}
            <Button variant="outline" size="sm" className="w-full" disabled={isDeleting}>
              <Eye className="h-4 w-4 mr-2" /> {t("persona_card.details_button")}
            </Button>
          </Link>

          {/* 2. Chat with Persona */}
          <Link to={`/persona/${persona.id}/chat?persona=${persona.persona_name}`}>
            <Button size="sm" className="w-full" disabled={isActionDisabled}>
              <MessageSquare className="h-4 w-4 mr-2" /> {t("persona_card.chat_button")}
            </Button>
          </Link>

          {/* 3. Add More Knowledge */}
          <Link to={`/persona/${persona.id}/knowledge`}>
            <Button variant="secondary" size="sm" className="w-full" disabled={isDeleting}>
              <FilePlus className="h-4 w-4 mr-2" /> {t("persona_card.knowledge_button")}
            </Button>
          </Link>

          {/* 4. Delete Persona */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(persona.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? t("persona_card.deleting") : t("persona_card.delete_button")}
          </Button>

        </div>
        {persona.status !== 'ready' && (
          <p className="text-xs text-center text-orange-500 mt-3">
            {t("persona_card.actions_disabled_prefix")} **{persona.status.toUpperCase()}**{t("persona_card.actions_disabled_suffix")}.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaCard;