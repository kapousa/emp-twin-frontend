import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  BookOpen,
  Trash2,
  Eye,
  Loader2,
  FilePlus,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Define the expected structure of a Persona object
interface Persona {
  id: string; // Changed to string (UUID)
  personaName: string;
  personaRole: string;
  avatar_url: string | null;
  status: 'queued' | 'processing' | 'ready' | 'failed';
}

interface PersonaCardProps {
  persona: Persona;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const PersonaCard = ({ persona, onDelete, isDeleting }: PersonaCardProps) => {
  const { t } = useTranslation(); // Initialize useTranslation

  // --- FOR DEMO ONLY: Force a dynamic static avatar image ---
  const numberOfStaticAvatars = 5; // e.g., you have user-placeholder-1.png to user-placeholder-5.png
  const basePlaceholderName = "/user-placeholder-"; // e.g., leads to /user-placeholder-1.png

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
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-center space-x-4 pb-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={dynamicStaticAvatarSrc}
            alt={`${persona.personaName}'s avatar`}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-avatar.png";
            }}
          />
        </div>

        {/* Name and Role */}
        <div className="flex-1">
          <CardTitle className="text-xl">{persona.personaName}</CardTitle>
          <CardDescription className="flex items-center space-x-2 mt-1">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span>{t("persona_card.role_prefix")} {persona.personaRole}</span> {/* Use translation key */}
          </CardDescription>
        </div>

        {/* Status Badge */}
        {getStatusDisplay(persona.status)}
      </CardHeader>

      <CardContent className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-3">

          {/* 1. See Details */}
          <Link to={`/admin/personas/${persona.id}/details`}>
            <Button variant="outline" size="sm" className="w-full" disabled={isDeleting}>
              <Eye className="h-4 w-4 mr-2" /> {t("persona_card.details_button")} {/* Use translation key */}
            </Button>
          </Link>

          {/* 2. Chat with Persona */}
          <Link to={`/ask?personaId=${persona.id}`}>
            <Button size="sm" className="w-full" disabled={isActionDisabled}>
              <MessageSquare className="h-4 w-4 mr-2" /> {t("persona_card.chat_button")} {/* Use translation key */}
            </Button>
          </Link>

          {/* 3. Add More Knowledge */}
          <Link to={`/admin/personas/${persona.id}/add-knowledge`}>
            <Button variant="secondary" size="sm" className="w-full" disabled={isDeleting}>
              <FilePlus className="h-4 w-4 mr-2" /> {t("persona_card.knowledge_button")} {/* Use translation key */}
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
            {isDeleting ? t("persona_card.deleting") : t("persona_card.delete_button")} {/* Use translation key */}
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