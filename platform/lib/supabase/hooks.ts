'use client';
import { useEffect, useState } from 'react';
import { createClient } from './client';

const supabase = createClient();

export function useVtrs() {
  const [vtrs, setVtrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_vtr')
      .select('*')
      .eq('ativo', true)
      .order('nome')
      .then(({ data, error }) => {
        if (data) setVtrs(data);
        setLoading(false);
      });
  }, []);

  return { vtrs, loading };
}

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_funcionario')
      .select('*')
      .order('nome')
      .then(({ data, error }) => {
        if (data) setFuncionarios(data);
        setLoading(false);
      });
  }, []);

  return { funcionarios, loading };
}

export function useLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_lead')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setLeads(data);
        setLoading(false);
      });
  }, []);

  return { leads, loading };
}

export function useDocumentos() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_documento')
      .select('*')
      .order('data_vencimento')
      .then(({ data, error }) => {
        if (data) setDocs(data);
        setLoading(false);
      });
  }, []);

  return { docs, loading };
}

export function usePneus() {
  const [pneus, setPneus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_pneu')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (data) setPneus(data);
        setLoading(false);
      });
  }, []);

  return { pneus, loading };
}

export function useMultas() {
  const [multas, setMultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_multa')
      .select('*')
      .order('data_infracao', { ascending: false })
      .then(({ data, error }) => {
        if (data) setMultas(data);
        setLoading(false);
      });
  }, []);

  return { multas, loading };
}

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plat_fornecedor')
      .select('*')
      .eq('ativo', true)
      .order('nome')
      .then(({ data, error }) => {
        if (data) setFornecedores(data);
        setLoading(false);
      });
  }, []);

  return { fornecedores, loading };
}

export function useEquipamentos(vtrId?: string) {
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from('plat_equipamento').select('*').order('categoria');
    if (vtrId) query = query.eq('vtr_id', vtrId);
    query.then(({ data, error }) => {
      if (data) setEquipamentos(data);
      setLoading(false);
    });
  }, [vtrId]);

  return { equipamentos, loading };
}

export function usePendencias(vtrId?: string) {
  const [pendencias, setPendencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('plat_pendencia')
      .select('*')
      .eq('status', 'aberta')
      .order('created_at', { ascending: false });
    if (vtrId) query = query.eq('vtr_id', vtrId);
    query.then(({ data, error }) => {
      if (data) setPendencias(data);
      setLoading(false);
    });
  }, [vtrId]);

  return { pendencias, loading };
}
