This project adheres to specific coding conventions:

1. **Self-Documenting Code**: Avoid inline comments or JSDoc unless absolutely necessary. Code should be clear and expressive enough to explain itself through naming and structure.
2. **Functional Programming Principles**: Use functional, immutable coding patterns wherever possible. Avoid mutation of data or the use of `let`.
3. **Testing Standards**: Co-locate test files near their implementation, and ensure comprehensive test coverage for all utilities, phases, and state transitions.
4. **Preferred Libraries**:
   - `pnpm` for package management.
   - `vitest` with React Testing Library for testing.
   - `xstate v5` for state management.

This file is a reference point for all contributors to maintain consistency across the codebase.
