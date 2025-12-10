import axios from 'axios';

const PROVINCES_API = 'https://provinces.open-api.vn/api';

export interface Province {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface District {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
}

export interface ProvinceDetail extends Province {
  districts: District[];
}

export interface DistrictDetail extends District {
  wards: Ward[];
}

// Get all provinces
export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await axios.get(`${PROVINCES_API}/p/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

// Get province with districts
export const getProvinceWithDistricts = async (provinceCode: number): Promise<ProvinceDetail | null> => {
  try {
    const response = await axios.get(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
    return response.data;
  } catch (error) {
    console.error('Error fetching province details:', error);
    return null;
  }
};

// Get district with wards
export const getDistrictWithWards = async (districtCode: number): Promise<DistrictDetail | null> => {
  try {
    const response = await axios.get(`${PROVINCES_API}/d/${districtCode}?depth=2`);
    return response.data;
  } catch (error) {
    console.error('Error fetching district details:', error);
    return null;
  }
};

// Search provinces by name
export const searchProvinces = async (keyword: string): Promise<Province[]> => {
  try {
    const response = await axios.get(`${PROVINCES_API}/p/search/?q=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching provinces:', error);
    return [];
  }
};
