import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bangladeshAddresses, type District, type Upazila, type Union, type PostOffice } from '@/data/bangladeshAddresses';

export interface AddressData {
  division: string;
  district: string;
  upazila: string;
  union: string;
  postOffice: string;
  village: string;
}

interface AddressFieldsProps {
  label: string;
  value: AddressData;
  onChange: (data: AddressData) => void;
  disabled?: boolean;
}

const AddressFields = ({ label, value, onChange, disabled }: AddressFieldsProps) => {
  const { language } = useLanguage();
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);

  useEffect(() => {
    if (value.division) {
      const div = bangladeshAddresses.find(d => d.nameEn === value.division);
      setDistricts(div?.districts || []);
    } else {
      setDistricts([]);
    }
  }, [value.division]);

  useEffect(() => {
    if (value.district) {
      const dist = districts.find(d => d.nameEn === value.district);
      setUpazilas(dist?.upazilas || []);
    } else {
      setUpazilas([]);
    }
  }, [value.district, districts]);

  useEffect(() => {
    if (value.upazila) {
      const upz = upazilas.find(u => u.nameEn === value.upazila);
      setUnions(upz?.unions || []);
      setPostOffices(upz?.postOffices || []);
    } else {
      setUnions([]);
      setPostOffices([]);
    }
  }, [value.upazila, upazilas]);

  const groupedUpazilas = useMemo(() => {
    const cityCorps = upazilas.filter(u => u.type === 'city_corporation');
    const municipalities = upazilas.filter(u => u.type === 'municipality');
    const regular = upazilas.filter(u => !u.type || u.type === 'upazila');
    return { cityCorps, municipalities, regular };
  }, [upazilas]);

  const update = (field: keyof AddressData, val: string) => {
    const newData = { ...value, [field]: val };
    if (field === 'division') { newData.district = ''; newData.upazila = ''; newData.union = ''; newData.postOffice = ''; }
    if (field === 'district') { newData.upazila = ''; newData.union = ''; newData.postOffice = ''; }
    if (field === 'upazila') { newData.union = ''; newData.postOffice = ''; }
    onChange(newData);
  };

  return (
    <div>
      <h3 className="text-md font-display font-semibold text-foreground mb-3">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>{language === 'bn' ? 'বিভাগ' : 'Division'}</Label>
          <Select value={value.division} onValueChange={(v) => update('division', v)} disabled={disabled}>
            <SelectTrigger className="bg-background mt-1"><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
            <SelectContent>
              {bangladeshAddresses.map(d => (
                <SelectItem key={d.nameEn} value={d.nameEn}>{language === 'bn' ? d.name : d.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'bn' ? 'জেলা' : 'District'}</Label>
          <Select value={value.district} onValueChange={(v) => update('district', v)} disabled={disabled || !value.division}>
            <SelectTrigger className="bg-background mt-1"><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
            <SelectContent>
              {districts.map(d => (
                <SelectItem key={d.nameEn} value={d.nameEn}>{language === 'bn' ? d.name : d.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'bn' ? 'উপজেলা / সিটি কর্পোরেশন / পৌরসভা' : 'Upazila / City Corp / Municipality'}</Label>
          <Select value={value.upazila} onValueChange={(v) => update('upazila', v)} disabled={disabled || !value.district}>
            <SelectTrigger className="bg-background mt-1"><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
            <SelectContent>
              {groupedUpazilas.cityCorps.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold text-primary">
                    {language === 'bn' ? '🏛️ সিটি কর্পোরেশন' : '🏛️ City Corporation'}
                  </SelectLabel>
                  {groupedUpazilas.cityCorps.map(u => (
                    <SelectItem key={u.nameEn} value={u.nameEn}>{language === 'bn' ? u.name : u.nameEn}</SelectItem>
                  ))}
                </SelectGroup>
              )}
              {groupedUpazilas.municipalities.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold text-primary">
                    {language === 'bn' ? '🏘️ পৌরসভা' : '🏘️ Municipality'}
                  </SelectLabel>
                  {groupedUpazilas.municipalities.map(u => (
                    <SelectItem key={u.nameEn} value={u.nameEn}>{language === 'bn' ? u.name : u.nameEn}</SelectItem>
                  ))}
                </SelectGroup>
              )}
              {groupedUpazilas.regular.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold text-muted-foreground">
                    {language === 'bn' ? '🏡 উপজেলা' : '🏡 Upazila'}
                  </SelectLabel>
                  {groupedUpazilas.regular.map(u => (
                    <SelectItem key={u.nameEn} value={u.nameEn}>{language === 'bn' ? u.name : u.nameEn}</SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'bn' ? 'ইউনিয়ন / ওয়ার্ড' : 'Union / Ward'}</Label>
          <Select value={value.union} onValueChange={(v) => update('union', v)} disabled={disabled || !value.upazila}>
            <SelectTrigger className="bg-background mt-1"><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
            <SelectContent>
              {unions.map(u => (
                <SelectItem key={u.nameEn} value={u.nameEn}>{language === 'bn' ? u.name : u.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'bn' ? 'পোস্ট অফিস' : 'Post Office'}</Label>
          {postOffices.length > 0 ? (
            <Select value={value.postOffice} onValueChange={(v) => update('postOffice', v)} disabled={disabled || !value.upazila}>
              <SelectTrigger className="bg-background mt-1"><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
              <SelectContent>
                {postOffices.map(po => (
                  <SelectItem key={po.code} value={`${po.nameEn} - ${po.code}`}>
                    {po.nameEn} - {po.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input className="bg-background mt-1" value={value.postOffice} onChange={(e) => update('postOffice', e.target.value)} disabled={disabled} placeholder={language === 'bn' ? 'পোস্ট অফিস লিখুন' : 'Enter post office'} />
          )}
        </div>
        <div>
          <Label>{language === 'bn' ? 'গ্রাম' : 'Village'}</Label>
          <Input className="bg-background mt-1" value={value.village} onChange={(e) => update('village', e.target.value)} disabled={disabled} />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
