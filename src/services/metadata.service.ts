import apiConfig from '@/lib/api.config';

export class MetadataService {
    async getEducations() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.metadata.education}`);
        return res.json();
    }

    async getOccupations() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.metadata.occupation}`);
        return res.json();
    }

    async getLocationByPincode(pin: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.metadata.locationByPin(pin)}`);
        return res.json();
    }

    async getFaqs() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.public.faq}`);
        return res.json();
    }

    async getSuccessStories() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.public.successStories}`);
        return res.json();
    }

    async getActiveTheme() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.public.theme}/active`);
        return res.json();
    }
}

export const metadataService = new MetadataService();
export default metadataService;
