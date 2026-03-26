import os
import shutil

class GuardiaoFox:
    """
    O Guardião Fox garante a integridade dos arquivos e diretórios.
    """
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.temp_dir = os.path.join(root_dir, "temp")
        self.output_dir = os.path.join(root_dir, "output")
        self._setup_folders()

    def _setup_folders(self):
        """Cria pastas necessárias se não existirem."""
        for folder in [self.temp_dir, self.output_dir]:
            if not os.path.exists(folder):
                os.makedirs(folder)
                print(f"[Guardião] Pasta criada: {folder}")

    def validate_file(self, file_path):
        """Verifica se o arquivo existe e é válido."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"[Guardião] Arquivo não encontrado: {file_path}")
        return True

    def cleanup_temp(self):
        """Limpa a pasta temporária após o processamento."""
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            os.makedirs(self.temp_dir)
            print("[Guardião] Pasta temporária limpa.")

    def get_output_path(self, filename):
        """Gera o caminho final para o arquivo de saída."""
        return os.path.join(self.output_dir, filename)

    def get_temp_path(self, filename):
        """Gera o caminho para um arquivo temporário."""
        return os.path.join(self.temp_dir, filename)
