import type { Page } from 'playwright';

export async function fillWelcomeForm(page: Page, {
	name,
	slug,
	companySize,
	role,
}: {
	name: string;
	slug: string;
	companySize?: string;
	role?: string;
}) {
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Slug').fill(slug);

	if (companySize !== undefined) {
		await page.getByLabel('How large is your company?').click();
		await page.getByText(companySize).click();
	}

	if (role !== undefined) {
		await page.getByLabel('What is your role?').click();
		await page.getByText(role).click();
	}

	await page.getByText('Create workspace').click();
}
