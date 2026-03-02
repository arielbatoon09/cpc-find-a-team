import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FACTIONS } from "@/lib/divergents";
import { MotionPage } from "@/components/common/motion-page";
import { 
  HelpCircle, 
  Users, 
  ShieldCheck, 
  UserCircle 
} from "lucide-react";

export default function FAQPage() {
  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center space-x-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              General Information
            </h2>
            <Accordion type="single" collapsible className="w-full bg-card border rounded-lg overflow-hidden">
              <AccordionItem value="item-1" className="px-4">
                <AccordionTrigger className="hover:no-underline">Who can create a team?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Only <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Representative</Badge> or <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Admin</Badge> users have the permissions to create teams. If you are a student and want to form a team, please approach your assigned representative.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="px-4">
                <AccordionTrigger className="hover:no-underline">How do I join a team?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can browse available teams in the <span className="font-medium text-foreground">Teams</span> page. Once you find a team with available slots for your section, you can request to join and wait for approval.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="px-4 border-none">
                <AccordionTrigger className="hover:no-underline text-destructive">Data Accuracy Warning</AccordionTrigger>
                <AccordionContent className="text-muted-foreground italic">
                  Please ensure that all team names and section assignments are accurate. Providing <span className="font-semibold text-destructive">invalid names or incorrect sections</span> may result in your team being declined by the department.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Divergent Instructors
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(FACTIONS).map((faction) => (
                <div 
                  key={faction.name} 
                  className={`p-5 rounded-xl border ${faction.border} ${faction.bg} flex flex-col space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${faction.color}`}>{faction.name}</h3>
                    <Badge variant="outline" className={`${faction.border} ${faction.color}`}>
                      Faction
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <UserCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Instructor to Approach</p>
                        <p className="font-medium">{faction.representative}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Sections: {faction.sections.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-muted/30 p-6 rounded-lg border border-dashed text-center">
              <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Reach out to your assigned instructor or visit the IT Department office for assistance.
              </p>
          </section>
        </div>
      </div>
    </MotionPage>
  );
}
