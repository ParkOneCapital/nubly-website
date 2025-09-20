import React from 'react';
import {
  Card,
  CardFooter,
  CardDescription,
  CardAction,
  CardHeader,
  CardTitle,
} from './ui/card';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

type CardContainerProps = {
  accessCode: string | null;
  cardId: string;
  title: string;
  description: string;
  className?: string;
  link: string;
  permissions: { view: boolean | undefined; download: boolean | undefined };
};

const LOG_RESEARCH_INTERACTION_URL = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL}/logResearchInteraction`;

const CardContainer = ({
  accessCode,
  cardId,
  className,
  title,
  description,
  link,
  permissions,
}: CardContainerProps) => {
  const handleDownload = async (filename: string) => {
    //check for permission to download
    if (!permissions.download) {
      window.alert('Download is not allowed for this resource.');

      await fetch(LOG_RESEARCH_INTERACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: cardId,
          action: 'download',
          accessCode: accessCode,
          clientTimestamp: new Date().toISOString(),
          context: 'NublyResearch',
          success: false,
        }),
      });
      return;
    }

    await fetch(LOG_RESEARCH_INTERACTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: cardId,
        action: 'download',
        accessCode: accessCode,
        clientTimestamp: new Date().toISOString(),
        context: 'NublyResearch',
        success: true,
      }),
    });

    const link = document.createElement('a');
    link.href = `/documents/${filename}.pdf`; // or your dynamic URL
    link.download = `${filename}.pdf`; // optional: specify filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = async (link: string) => {
    //check for permission to view
    if (!permissions.view) {
      await fetch(LOG_RESEARCH_INTERACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: cardId,
          action: 'view',
          accessCode: accessCode,
          clientTimestamp: new Date().toISOString(),
          context: 'NublyResearch',
          success: false,
        }),
      });

      window.alert('View is not allowed for this resource.');

      return;
    }

    await fetch(LOG_RESEARCH_INTERACTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: cardId,
        action: 'view',
        accessCode: accessCode,
        clientTimestamp: new Date().toISOString(),
        context: 'NublyResearch',
        success: true,
      }),
    });

    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={cn('w-3/4 md:w-full bg-base-grey', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="-pt-5">
          <Download
            onClick={() => handleDownload(cardId)}
            className="text-muted-foreground hover:text-nubly-blue/60"
          />
        </CardAction>
      </CardHeader>
      <CardFooter>
        {/* <Button
          type="button"
          onClick={() => handleDownload(cardId)}
          className="w-1/2 bg-nubly-blue/80 text-white hover:bg-nubly-blue/60 active:bg-nubly-blue">
          Download
        </Button> */}
        <Button
          type="button"
          className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40"
          onClick={async () => await handleView(link)}>
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardContainer;
