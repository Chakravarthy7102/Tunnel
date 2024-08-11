import { outdent } from 'outdent';

// Courtesy of https://community.atlassian.com/t5/Jira-Software-articles/How-to-write-a-useful-Jira-ticket/ba-p/2147004
export function getIntegrationPrompt(description: string) {
	return outdent`
		The title is the most important part of a ticket. Some teams use tickets where the title is the sole content of the ticket. Here are some best practices for good ticket titles:

		Phrase the title as an imperative command starting with a verb (like a good commit message)
		Be a descriptive as you can with the limited characters allowed
		Use the form, “To complete this ticket, I need to $TICKET_TITLE”, but without any quotes
		A good title jogs the memory of what needs doing. Here are some example titles that need clarification:

		TCS workspace tagging
		Content Policy detail page
		Add CPS search filters
		And here are the improved versions of the same tickets:

		Spike on method of TCS storage for workspace tagging
		Implement Content Policy Detail Page "Created by" section to render user name and avatar

		It is important that in your response, you give me the title of the ticket without any quotes.

		Now, your job is to write a good title for this ticket. Here is the description:
		${description}
	`;
}
