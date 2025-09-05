
const createNotebookContent = (pythonCode: string) => {
  const notebook = {
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '# Auto-Generated Research Baseline Notebook\n\n',
          'This notebook provides a starting point for experimentation based on the research topic. ',
          'It includes a basic model architecture and placeholder functions for the training pipeline.'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: pythonCode.split('\n').map(line => line + '\n')
      },
       {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '## Next Steps\n\n',
          '1.  **Load Data:** Implement the `load_dataset` function to load your specific dataset.\n',
          '2.  **Customize Model:** Adjust the model architecture in the provided class to better suit your needs.\n',
          '3.  **Train Model:** Run the training loop and monitor the performance.\n',
          '4.  **Evaluate:** Use the evaluation function to test your model\'s performance on a test set.'
        ]
      }
    ],
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      },
      language_info: {
        name: 'python',
        version: '3.9.12' // Example version
      }
    },
    nbformat: 4,
    nbformat_minor: 5
  };

  return JSON.stringify(notebook, null, 2);
};

export const createNotebookFile = (pythonCode: string): File => {
  const content = createNotebookContent(pythonCode);
  return new File([content], 'notebook.ipynb', { type: 'application/x-ipynb+json' });
};
