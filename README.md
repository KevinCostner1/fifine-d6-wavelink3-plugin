# 🎙️ Wave Link 3 Universal — FIFINE AmpliGame D6

🇧🇷 **Português** | 🇺🇸 **English**

Plugin comunitário e independente para controlar o **Elgato Wave Link 3** diretamente pelo **FIFINE AmpliGame D6 / FIFINE Control Deck**.

---

# 🇧🇷 Português

## 🎛️ Sobre o projeto

O **Wave Link 3 Universal** transforma o FIFINE AmpliGame D6 em um controlador físico para o Elgato Wave Link 3.

O plugin permite controlar canais, volumes, mute e mixes diretamente pelos botões do D6, sem precisar abrir o Wave Link durante o uso.

A comunicação com o Wave Link é realizada através da interface WebSocket local.

## ✨ Recursos

- 🎙️ **Mute / Unmute**
- 🔊 **Volume +**
- 🔉 **Volume −**
- ⌨️ Repetição ao pressionar e segurar Volume + / −
- 🎚️ **Entrada / Canal**
- 🔊 **Saída**
- 🎛️ **AUX / Mix**
- 🎯 Seleção individual do alvo para cada botão
- 📊 Exibição da porcentagem de volume
- 🔴🟢 Indicadores visuais de estado
- 💾 Configurações persistentes por botão
- 🔄 Reconexão automática com o Wave Link
- 🌎 Detecção automática do idioma do Control Deck
- 🇧🇷 Português
- 🇺🇸 Inglês
- 🇨🇳 Chinês simplificado
- 🇹🇼 Chinês tradicional
- 🖥️ Títulos utilizando o sistema nativo do FIFINE Control Deck

## 🎯 Tipos de alvo

Cada botão pode ser configurado individualmente.

Os tipos disponíveis incluem:

- **Entrada / Canal**
- **Canal em um Mix**
- **Mix / Saída do Mix**
- **Entrada física**
- **Saída física**

Exemplo:

```text
Tipo de alvo:
Mix / Saída do Mix

Alvo:
OBS
```

Assim, um botão pode controlar especificamente o Mix do OBS.

## 💾 Configurações persistentes

As configurações são armazenadas individualmente para cada botão.

Isso inclui:

- Tipo de alvo
- Alvo
- Mix
- Configurações da ação

Ao sair e abrir novamente o FIFINE Control Deck, as configurações permanecem salvas.

## 🖥️ Títulos

O plugin utiliza o **sistema nativo de títulos do FIFINE Control Deck**.

Isso significa que o usuário pode utilizar normalmente as opções disponíveis no próprio Control Deck para:

- posição;
- fonte;
- tamanho;
- negrito;
- alinhamento;
- visibilidade.

O plugin não cria um título adicional sobre a imagem.

## 📦 Instalação

### Método recomendado

1. Baixe a versão desejada na seção **Releases**.
2. Extraia o arquivo `.zip`.
3. Execute:

```text
Instalar-WaveLink3.bat
```

4. O instalador fará a instalação automaticamente.
5. Abra o FIFINE Control Deck.
6. Procure pela categoria:

```text
Wave Link 3 Universal
```

## ⚙️ Requisitos

- Windows 10 ou superior
- FIFINE AmpliGame D6
- FIFINE Control Deck
- Elgato Wave Link 3

O Wave Link 3 deve estar instalado e em execução.

## 🔌 Como funciona

O Wave Link 3 disponibiliza uma interface WebSocket local.

O plugin:

1. Detecta as informações de conexão do Wave Link.
2. Conecta ao WebSocket local.
3. Obtém os canais e mixes disponíveis.
4. Permite selecionar o alvo desejado.
5. Envia comandos de volume e mute.
6. Atualiza o estado visual do botão.

O volume do Wave Link utiliza uma escala de `0.0` a `1.0`.

## 🧪 Status

### V1.0.0

- ✅ Integração com Wave Link 3
- ✅ Entrada / Canal
- ✅ Canal em Mix
- ✅ Mix / Saída do Mix
- ✅ Entrada física
- ✅ Saída física
- ✅ Mute / Unmute
- ✅ Volume +
- ✅ Volume −
- ✅ Repetição ao segurar
- ✅ Porcentagem de volume
- ✅ Indicadores visuais
- ✅ Configuração persistente
- ✅ Títulos nativos do Control Deck
- ✅ Detecção automática de idioma
- ✅ Reconexão com Wave Link
- ✅ Instalador `.bat`

## 🐛 Bugs e sugestões

Encontrou algum problema ou tem uma sugestão?

Abra uma **Issue** neste repositório.

Ao relatar um problema, informe, se possível:

- versão do Windows;
- versão do FIFINE Control Deck;
- versão do Wave Link;
- ação utilizada;
- tipo de alvo;
- comportamento esperado;
- comportamento observado.

Screenshots e logs são bem-vindos.

## 👨‍💻 Autor

**Kevin Costner**

🎮 Twitch: https://twitch.tv/costnergg

Projeto independente desenvolvido para a comunidade FIFINE / Stream Controller.

---

# 🇺🇸 English

## 🎛️ About

**Wave Link 3 Universal** turns the FIFINE AmpliGame D6 into a physical controller for Elgato Wave Link 3.

The plugin allows you to control channels, volume, mute and mixes directly from the D6 keys without having to open Wave Link while using your computer.

Communication with Wave Link is performed through its local WebSocket interface.

## ✨ Features

- 🎙️ **Mute / Unmute**
- 🔊 **Volume +**
- 🔉 **Volume −**
- ⌨️ Press and hold for repeated volume changes
- 🎚️ **Input / Channel**
- 🔊 **Output**
- 🎛️ **AUX / Mix**
- 🎯 Individual target selection for each button
- 📊 Volume percentage display
- 🔴🟢 Visual state indicators
- 💾 Persistent per-button settings
- 🔄 Automatic Wave Link reconnection
- 🌎 Automatic Control Deck language detection
- 🇧🇷 Portuguese
- 🇺🇸 English
- 🇨🇳 Simplified Chinese
- 🇹🇼 Traditional Chinese
- 🖥️ Native FIFINE Control Deck titles

## 🎯 Target types

Each button can be configured independently.

Available target types include:

- **Input / Channel**
- **Channel in Mix**
- **Mix / Mix Output**
- **Physical Input**
- **Physical Output**

Example:

```text
Target Type:
Mix / Mix Output

Target:
OBS
```

This allows a button to control the OBS Mix specifically.

## 💾 Persistent settings

Settings are stored individually for each button.

This includes:

- Target type
- Target
- Mix
- Action settings

Settings remain saved after restarting FIFINE Control Deck.

## 🖥️ Titles

The plugin uses the **native FIFINE Control Deck title system**.

This allows users to use the Control Deck's normal options for:

- position;
- font;
- size;
- bold;
- alignment;
- visibility.

The plugin does not create an additional title over the button image.

## 📦 Installation

### Recommended method

1. Download the desired version from **Releases**.
2. Extract the `.zip` file.
3. Run:

```text
Instalar-WaveLink3.bat
```

4. The installer will automatically install the plugin.
5. Open FIFINE Control Deck.
6. Look for:

```text
Wave Link 3 Universal
```

## ⚙️ Requirements

- Windows 10 or newer
- FIFINE AmpliGame D6
- FIFINE Control Deck
- Elgato Wave Link 3

Wave Link 3 must be installed and running.

## 🔌 How it works

Wave Link 3 provides a local WebSocket interface.

The plugin:

1. Detects the Wave Link connection information.
2. Connects to the local WebSocket.
3. Retrieves available channels and mixes.
4. Allows the user to select a target.
5. Sends volume and mute commands.
6. Updates the button's visual state.

Wave Link volume uses a `0.0` to `1.0` scale.

## 🧪 Status

### V1.0.0

- ✅ Wave Link 3 integration
- ✅ Input / Channel
- ✅ Channel in Mix
- ✅ Mix / Mix Output
- ✅ Physical Input
- ✅ Physical Output
- ✅ Mute / Unmute
- ✅ Volume +
- ✅ Volume −
- ✅ Press-and-hold repeat
- ✅ Volume percentage
- ✅ Visual state indicators
- ✅ Persistent configuration
- ✅ Native Control Deck titles
- ✅ Automatic language detection
- ✅ Wave Link reconnection
- ✅ `.bat` installer

## 🐛 Bugs and suggestions

Found a bug or have a suggestion?

Please open an **Issue** in this repository.

When reporting a problem, please include:

- Windows version;
- FIFINE Control Deck version;
- Wave Link version;
- action being used;
- target type;
- expected behavior;
- actual behavior.

Screenshots and logs are welcome.

## 👨‍💻 Author

**Kevin Costner**

🎮 Twitch: https://twitch.tv/costnergg

Independent community project developed for the FIFINE / Stream Controller community.

---

# ⚠️ Disclaimer / Aviso

🇧🇷 Este é um projeto independente e **não é oficialmente afiliado, patrocinado ou desenvolvido pela FIFINE ou pela Elgato**.

🇺🇸 This is an independent community project and is **not officially affiliated with, sponsored by, or developed by FIFINE or Elgato**.

FIFINE, AmpliGame, D6 and Wave Link are trademarks of their respective owners.
