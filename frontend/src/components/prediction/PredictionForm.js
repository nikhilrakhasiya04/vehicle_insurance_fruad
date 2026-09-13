"use client";
import { useState } from "react";
import { submitPrediction } from "@/lib/api";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ChevronDown, ChevronUp, Send } from "lucide-react";

const defaultValues = {
  age_of_driver: 35,
  gender: "M",
  marital_status: 1,
  high_education: 1,
  annual_income: 60000,
  safety_rating: 75,
  address_change: 0,
  property_status: "Own",
  claim_month: 6,
  claim_year: 2024,
  claim_day_num: 15,
  claim_day_of_week: "Monday",
  accident_site: "Highway",
  past_num_of_claims: 0,
  witness_present: 0,
  liab_prct: 50,
  channel: "Phone",
  police_report: 1,
  age_of_vehicle: 4,
  vehicle_category: "Medium",
  vehicle_price: 25000,
  vehicle_color: "silver",
  total_claim: 20000,
  injury_claim: 5000,
  policy_deductible: 1000,
  annual_premium: 1200,
  days_open: 9,
  form_defects: 2,
};

function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectInput({ name, value, onChange, options }) {
  return (
    <select name={name} value={value} onChange={onChange} className="input">
      {options.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function NumberInput({ name, value, onChange, min, max, step = 1 }) {
  return (
    <input type="number" name={name} value={value} onChange={onChange}
      min={min} max={max} step={step} className="input" />
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-800/60 hover:bg-gray-800 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>}
    </div>
  );
}

export default function PredictionForm({ onResult }) {
  const [form, setForm]           = useState(defaultValues);
  const [loading, setLoading]     = useState(false);
  const [openSections, setOpen]   = useState({ driver: true, claim: true, vehicle: false, financial: false });

  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const handle = (e) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitPrediction(form);
      toast.success("Prediction complete!");
      onResult(res.data);
    } catch (err) {
      toast.error(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setForm(defaultValues);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Driver / Policy Info */}
      <Section title="Driver & Policy Information" open={openSections.driver} onToggle={() => toggle("driver")}>
        <Field label="Age of Driver" required>
          <NumberInput name="age_of_driver" value={form.age_of_driver} onChange={handle} min={16} max={100} />
        </Field>
        <Field label="Gender" required>
          <SelectInput name="gender" value={form.gender} onChange={handle}
            options={[{ v: "M", l: "Male" }, { v: "F", l: "Female" }]} />
        </Field>
        <Field label="Marital Status" required>
          <SelectInput name="marital_status" value={form.marital_status} onChange={handle}
            options={[{ v: 1, l: "Married" }, { v: 0, l: "Single" }]} />
        </Field>
        <Field label="Higher Education" required>
          <SelectInput name="high_education" value={form.high_education} onChange={handle}
            options={[{ v: 1, l: "Yes" }, { v: 0, l: "No" }]} />
        </Field>
        <Field label="Annual Income ($)" required>
          <NumberInput name="annual_income" value={form.annual_income} onChange={handle} min={0} step={1000} />
        </Field>
        <Field label="Safety Rating (0–100)" required>
          <NumberInput name="safety_rating" value={form.safety_rating} onChange={handle} min={0} max={100} />
        </Field>
        <Field label="Address Changed?" required>
          <SelectInput name="address_change" value={form.address_change} onChange={handle}
            options={[{ v: 0, l: "No" }, { v: 1, l: "Yes" }]} />
        </Field>
        <Field label="Property Status" required>
          <SelectInput name="property_status" value={form.property_status} onChange={handle}
            options={[{ v: "Own", l: "Own" }, { v: "Rent", l: "Rent" }]} />
        </Field>
      </Section>

      {/* Claim Details */}
      <Section title="Claim Details" open={openSections.claim} onToggle={() => toggle("claim")}>
        <Field label="Claim Month" required>
          <NumberInput name="claim_month" value={form.claim_month} onChange={handle} min={1} max={12} />
        </Field>
        <Field label="Claim Year" required>
          <NumberInput name="claim_year" value={form.claim_year} onChange={handle} min={2000} max={2030} />
        </Field>
        <Field label="Claim Day" required>
          <NumberInput name="claim_day_num" value={form.claim_day_num} onChange={handle} min={1} max={31} />
        </Field>
        <Field label="Day of Week" required>
          <SelectInput name="claim_day_of_week" value={form.claim_day_of_week} onChange={handle}
            options={["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => ({ v: d, l: d }))} />
        </Field>
        <Field label="Accident Site" required>
          <SelectInput name="accident_site" value={form.accident_site} onChange={handle}
            options={[{ v: "Highway", l: "Highway" }, { v: "Local", l: "Local" }, { v: "Parking Lot", l: "Parking Lot" }]} />
        </Field>
        <Field label="Past Claims" required>
          <NumberInput name="past_num_of_claims" value={form.past_num_of_claims} onChange={handle} min={0} max={20} />
        </Field>
        <Field label="Witness Present?" required>
          <SelectInput name="witness_present" value={form.witness_present} onChange={handle}
            options={[{ v: 0, l: "No" }, { v: 1, l: "Yes" }]} />
        </Field>
        <Field label="Liability %" required>
          <NumberInput name="liab_prct" value={form.liab_prct} onChange={handle} min={0} max={100} />
        </Field>
        <Field label="Channel" required>
          <SelectInput name="channel" value={form.channel} onChange={handle}
            options={[{ v: "Phone", l: "Phone" }, { v: "Online", l: "Online" }, { v: "Broker", l: "Broker" }]} />
        </Field>
        <Field label="Police Report Filed?" required>
          <SelectInput name="police_report" value={form.police_report} onChange={handle}
            options={[{ v: 0, l: "No" }, { v: 1, l: "Yes" }]} />
        </Field>
      </Section>

      {/* Vehicle Info */}
      <Section title="Vehicle Information" open={openSections.vehicle} onToggle={() => toggle("vehicle")}>
        <Field label="Age of Vehicle (yrs)" required>
          <NumberInput name="age_of_vehicle" value={form.age_of_vehicle} onChange={handle} min={0} max={30} />
        </Field>
        <Field label="Vehicle Category" required>
          <SelectInput name="vehicle_category" value={form.vehicle_category} onChange={handle}
            options={[{ v: "Compact", l: "Compact" }, { v: "Medium", l: "Medium" }, { v: "Large", l: "Large" }]} />
        </Field>
        <Field label="Vehicle Price ($)" required>
          <NumberInput name="vehicle_price" value={form.vehicle_price} onChange={handle} min={0} step={500} />
        </Field>
        <Field label="Vehicle Color" required>
          <SelectInput name="vehicle_color" value={form.vehicle_color} onChange={handle}
            options={["silver","black","gray","red","white","blue","other"].map((c) => ({ v: c, l: c.charAt(0).toUpperCase() + c.slice(1) }))} />
        </Field>
      </Section>

      {/* Financial */}
      <Section title="Financial & Policy Details" open={openSections.financial} onToggle={() => toggle("financial")}>
        <Field label="Total Claim ($)" required>
          <NumberInput name="total_claim" value={form.total_claim} onChange={handle} min={0} step={100} />
        </Field>
        <Field label="Injury Claim ($)" required>
          <NumberInput name="injury_claim" value={form.injury_claim} onChange={handle} min={0} step={100} />
        </Field>
        <Field label="Policy Deductible ($)" required>
          <SelectInput name="policy_deductible" value={form.policy_deductible} onChange={handle}
            options={[{ v: 500, l: "$500" }, { v: 1000, l: "$1,000" }, { v: 2000, l: "$2,000" }]} />
        </Field>
        <Field label="Annual Premium ($)" required>
          <NumberInput name="annual_premium" value={form.annual_premium} onChange={handle} min={0} step={50} />
        </Field>
        <Field label="Days Open" required>
          <NumberInput name="days_open" value={form.days_open} onChange={handle} min={0} step={0.1} />
        </Field>
        <Field label="Form Defects" required>
          <NumberInput name="form_defects" value={form.form_defects} onChange={handle} min={0} max={20} />
        </Field>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
          {loading ? "Analyzing…" : "Analyze Claim"}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          Reset
        </button>
      </div>
    </form>
  );
}
