#!/bin/bash

# 1. Definir la cantidad de números a probar
CANTIDAD=10

# 2. Generar números aleatorios limpios y guardarlos en numeros.txt
shuf -i 1-$CANTIDAD -n $CANTIDAD | xargs > numbers.txt

# 3. Leer los números generados para pasárselos a push_swap
NUMEROS=$(cat numbers.txt)

# 4. Ejecutar push_swap y guardar las operaciones en movimientos.txt
./push_swap $NUMEROS > moves.txt

# 5. Mostrar un resumen rápido por pantalla
MOVIMIENTOS=$(wc -l < moves.txt)
echo "✅ Test completed using $CANTIDAD numbers."
echo "🔢 Random numbers stored as numbers.txt"
echo "📜 push_swap movements storead as moves.txt"
echo "📊 Total movements needed for push_swap sorting: $MOVIMIENTOS"

