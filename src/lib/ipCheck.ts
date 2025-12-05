interface IPApiResponse {
    ip: string;
    rir: string;
    is_bogon: boolean;
    is_mobile: boolean;
    is_crawler: boolean;
    is_datacenter: boolean;
    is_tor: boolean;
    is_proxy: boolean;
    is_vpn: boolean;
    is_abuser: boolean;
    company?: {
        name: string;
        abuser_score: string;
        domain: string;
        type: string;
        network: string;
    };
    datacenter?: {
        datacenter: string;
        network: string;
        country: string;
        region: string;
        city: string;
    };
    asn?: {
        asn: number;
        abuser_score: string;
        route: string;
        descr: string;
        country: string;
        active: boolean;
        org: string;
        domain: string;
        abuse: string;
        type: string;
        created: string;
        updated: string;
        rir: string;
    };
    location?: {
        continent: string;
        country: string;
        country_code: string;
        state: string;
        city: string;
        latitude: number;
        longitude: number;
        zip: string;
        timezone: string;
        local_time: string;
        local_time_unix: number;
        is_dst: boolean;
    };
    elapsed_ms?: number;
    error?: string;
}

export interface SecurityCheckResult {
    ip: string;
    isSafe: boolean;
    checks: {
        datacenter: { detected: boolean; provider?: string };
        vpn: { detected: boolean };
        tor: { detected: boolean };
        proxy: { detected: boolean };
        abuser: { detected: boolean };
        crawler: { detected: boolean };
        mobile: { detected: boolean };
    };
    location?: {
        country: string;
        countryCode: string;
        city: string;
        timezone: string;
    };
    company?: {
        name: string;
        type: string;
        domain: string;
    };
    asn?: {
        number: number;
        org: string;
        type: string;
    };
    rawResponse?: IPApiResponse;
    apiError?: boolean;
}

export async function checkIP(ip: string, apiKey?: string): Promise<SecurityCheckResult> {
    try {
        const url = apiKey 
            ? `https://api.ipapi.is/?q=${ip}&key=${apiKey}`
            : `https://api.ipapi.is/?q=${ip}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: IPApiResponse = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Flag as unsafe for datacenter, vpn, proxy, tor, abuser, crawler
        const isSafe = !data.is_datacenter &&
                   !data.is_vpn &&
                   !data.is_proxy &&
                   !data.is_tor &&
                   !data.is_abuser &&
                   !data.is_crawler;

        return {
            ip: data.ip || ip,
            isSafe,
            checks: {
                datacenter: { 
                    detected: data.is_datacenter || false,
                    provider: data.datacenter?.datacenter
                },
                vpn: { detected: data.is_vpn || false },
                tor: { detected: data.is_tor || false },
                proxy: { detected: data.is_proxy || false },
                abuser: { detected: data.is_abuser || false },
                crawler: { detected: data.is_crawler || false },
                mobile: { detected: data.is_mobile || false },
            },
            location: data.location ? {
                country: data.location.country,
                countryCode: data.location.country_code,
                city: data.location.city,
                timezone: data.location.timezone,
            } : undefined,
            company: data.company ? {
                name: data.company.name,
                type: data.company.type,
                domain: data.company.domain,
            } : undefined,
            asn: data.asn ? {
                number: data.asn.asn,
                org: data.asn.org,
                type: data.asn.type,
            } : undefined,
            rawResponse: data,
        };
    } catch (error) {
        console.error('[IP Check] API error - failing open:', error);
        return {
            ip,
            isSafe: true,
            checks: {
                datacenter: { detected: false },
                vpn: { detected: false },
                tor: { detected: false },
                proxy: { detected: false },
                abuser: { detected: false },
                crawler: { detected: false },
                mobile: { detected: false },
            },
            apiError: true,
        };
    }
}

export function formatSecurityMessage(result: SecurityCheckResult): string {
    const statusIcon = result.isSafe ? '✅' : '🚨';
    const statusText = result.isSafe ? 'CLEAN' : 'FLAGGED';
    
    let message = `\n\n🔒 **Status:** ${statusIcon} ${statusText}`;
    
    if (result.location) {
        message += `\n🌍 **Location:** ${result.location.city}, ${result.location.country} (${result.location.countryCode})`;
    }
    
    const isp = result.asn?.org || result.company?.name || 'Unknown';
    message += `\n📡 **ISP:** ${isp}`;
    
    if (result.asn) {
        message += `\n🔢 **ASN:** AS${result.asn.number}`;
    }
    
    return message;
}
