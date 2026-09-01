export interface PageTemplate {
  id: string
  name: string
  description: string
  emoji: string
  title: string
  content: string
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Em branco',
    description: 'Página vazia para liberdade total',
    emoji: '📄',
    title: 'Sem título',
    content: '',
  },
  {
    id: 'todo',
    name: 'Lista de tarefas',
    description: 'Checklist simples para organizar o dia',
    emoji: '☑️',
    title: 'Lista de Tarefas',
    content: `<h1>Lista de Tarefas</h1><p>Marque as tarefas conforme avança (clique no texto para editar):</p><ul><li>☐ Tarefa 1 — <strong>Descreva aqui</strong></li><li>☐ Tarefa 2</li><li>☐ Tarefa 3</li></ul>`,
  },
  {
    id: 'meeting',
    name: 'Notas de reunião',
    description: 'Ata com pauta, decisões e próximos passos',
    emoji: '📝',
    title: 'Notas de Reunião',
    content: `<h1>Notas de Reunião</h1><p><strong>Data:</strong> __/__/____ · <strong>Participantes:</strong> ____________</p><h2>Pauta</h2><ol><li>Assunto 1</li><li>Assunto 2</li><li>Assunto 3</li></ol><h2>Anotações</h2><p>Escreva aqui os pontos discutidos...</p><h2>Decisões</h2><ul><li>Decisão 1</li><li>Decisão 2</li></ul><blockquote><strong>Próximos passos:</strong> definir responsáveis e prazos.</blockquote>`,
  },
  {
    id: 'study',
    name: 'Material de estudo',
    description: 'Resumo com tópicos, exemplos e revisão',
    emoji: '📚',
    title: 'Material de Estudo',
    content: `<h1>Material de Estudo</h1><h2>Resumo</h2><p>Escreva um resumo do conteúdo aqui.</p><h2>Pontos-chave</h2><ul><li>Ponto importante 1</li><li>Ponto importante 2</li></ul><h2>Exemplo</h2><pre><code>// Cole um exemplo de código aqui</code></pre><h2>Revisão</h2><blockquote>Anote dúvidas ou tópicos para revisar depois.</blockquote>`,
  },
  {
    id: 'week',
    name: 'Planejamento semanal',
    description: 'Organize sua semana por prioridades',
    emoji: '🗓️',
    title: 'Planejamento Semanal',
    content: `<h1>Planejamento Semanal</h1><p><strong>Semana de:</strong> __/__ à __/__</p><h2>Prioridades</h2><ol><li>Prioridade 1</li><li>Prioridade 2</li><li>Prioridade 3</li></ol><h2>Segunda</h2><ul><li>☐ Tarefa...</li></ul><h2>Terça</h2><ul><li>☐ Tarefa...</li></ul><h2>Quarta</h2><ul><li>☐ Tarefa...</li></ul><h2>Quinta</h2><ul><li>☐ Tarefa...</li></ul><h2>Sexta</h2><ul><li>☐ Tarefa...</li></ul>`,
  },
  {
    id: 'goals',
    name: 'Metas e objetivos',
    description: 'Defina metas curtas, médias e longas',
    emoji: '🎯',
    title: 'Metas e Objetivos',
    content: `<h1>Metas e Objetivos</h1><h2>Curto prazo (1-3 meses)</h2><ol><li>Meta 1</li><li>Meta 2</li></ol><h2>Médio prazo (3-12 meses)</h2><ol><li>Meta 1</li><li>Meta 2</li></ol><h2>Longo prazo (1+ anos)</h2><ol><li>Meta 1</li><li>Meta 2</li></ol><h2>Próximas ações</h2><ul><li>☐ Primeira ação...</li><li>☐ Segunda ação...</li></ul>`,
  },
  {
    id: 'pessoas',
    name: 'Lista de contatos',
    description: 'Registre pessoas com telefone e e-mail',
    emoji: '👥',
    title: 'Lista de Contatos',
    content: `<h1>Lista de Contatos</h1><ul><li><strong>Nome:</strong> ____________ · <strong>Tel:</strong> ____________ · <strong>E-mail:</strong> ____________</li><li><strong>Nome:</strong> ____________ · <strong>Tel:</strong> ____________ · <strong>E-mail:</strong> ____________</li><li><strong>Nome:</strong> ____________ · <strong>Tel:</strong> ____________ · <strong>E-mail:</strong> ____________</li></ul>`,
  },
]

export function getTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id)
}