{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = (import (inputs.nixpkgs) { inherit system; });

        devTools = with pkgs; [
          nodejs_24
          pnpm
          bun
          jq
          curl
          nodePackages.typescript
          nodePackages.typescript-language-server
          nodePackages.prettier
          nodePackages.eslint

          which
          gnused
          coreutils
        ];
      in {
        devShell = pkgs.mkShell {
          buildInputs = devTools;

          shellHook = ''
            echo "Route Builder Development Environment"

            # remove "warning: unhandled Platform key FamilyDisplayName"
            unset DEVELOPER_DIR
            
            # Add node_modules/.bin to PATH for direct access to nx and other tools
            export PATH="$PWD/node_modules/.bin:$PATH"
            
            # Set up environment variables
            export NODE_ENV=development
            export FORCE_COLOR=1
            export NPM_CONFIG_COLOR=always
            export NX_FORMAT_SORT_TSCONFIG_PATHS=false
            export NX_SOCKET_DIR=/tmp/nx-tmp

            
            # Automatically install dependencies if node_modules doesn't exist
            if [ ! -d "node_modules" ]; then
              echo "📦 Installing dependencies..."
              pnpm install
            fi
          '';
        };
      }
    );
}