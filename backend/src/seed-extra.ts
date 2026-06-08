import 'dotenv/config';
import pool from './db';
import { migrate } from './migrate';
import bcrypt from 'bcryptjs';

const users = [
  { name: 'Admin', email: 'admin@nutriplan.com', password: process.env.ADMIN_PASSWORD || 'admin123' },
  { name: 'María García', email: 'maria@ejemplo.com', password: process.env.MARIA_PASSWORD || 'maria123' },
  { name: 'Juan Pérez', email: 'juan@ejemplo.com', password: process.env.JUAN_PASSWORD || 'juan123' },
];

interface IngredientSeed { name: string; kcal: number; }

interface RecipeSeed {
  name: string; image: string; time: number; calories: number;
  difficulty: string; category: string; servings: number;
  ingredients: IngredientSeed[]; steps: string[];
}

const recipes: RecipeSeed[] = [
  {
    name: 'Tortilla española',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=300&fit=crop',
    time: 30, calories: 310, difficulty: 'Media', category: 'Comida', servings: 4,
    ingredients: [
      { name: '4 patatas medianas', kcal: 420 },
      { name: '6 huevos', kcal: 450 },
      { name: '1 cebolla', kcal: 40 },
      { name: 'Aceite de oliva abundante', kcal: 300 },
      { name: 'Sal al gusto', kcal: 0 },
    ],
    steps: ['Pela y corta las patatas en láminas finas. Pica la cebolla.', 'Fríe las patatas y la cebolla en aceite a fuego medio hasta que estén tiernas.', 'Escurre el aceite y mezcla con los huevos batidos y sal.', 'Cuaja la tortilla en una sartén a fuego medio por ambos lados.', 'Deja reposar 5 minutos antes de servir.'],
  },
  {
    name: 'Gazpacho andaluz',
    image: 'https://images.unsplash.com/photo-1614777735417-35bc5a4dcc0e?w=400&h=300&fit=crop',
    time: 15, calories: 120, difficulty: 'Fácil', category: 'Comida', servings: 4,
    ingredients: [
      { name: '1 kg de tomates maduros', kcal: 180 },
      { name: '1/2 pepino', kcal: 10 },
      { name: '1/2 pimiento verde', kcal: 12 },
      { name: '1 diente de ajo', kcal: 5 },
      { name: '4 cucharadas de aceite de oliva', kcal: 240 },
      { name: '2 cucharadas de vinagre', kcal: 6 },
      { name: 'Sal al gusto', kcal: 0 },
      { name: '200 ml de agua fría', kcal: 0 },
    ],
    steps: ['Lava y trocea todas las verduras.', 'Tritura todo junto con el aceite, vinagre, sal y agua.', 'Pasa por un colador fino para eliminar pieles y semillas.', 'Enfría en la nevera al menos 1 hora antes de servir.', 'Sirve con guarnición de pepino y pimiento picado.'],
  },
  {
    name: 'Crema de calabaza',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop',
    time: 35, calories: 180, difficulty: 'Fácil', category: 'Cena', servings: 4,
    ingredients: [
      { name: '800g de calabaza', kcal: 200 },
      { name: '1 cebolla', kcal: 40 },
      { name: '2 zanahorias', kcal: 50 },
      { name: '2 cucharadas de aceite de oliva', kcal: 180 },
      { name: '700 ml de caldo de verduras', kcal: 70 },
      { name: 'Sal, pimienta y nuez moscada', kcal: 0 },
      { name: 'Crema de leche para decorar', kcal: 180 },
    ],
    steps: ['Pela y trocea la calabaza, cebolla y zanahoria.', 'Sofríe la cebolla en aceite 5 minutos.', 'Añade la calabaza y zanahoria y rehoga 3 minutos.', 'Cubre con el caldo y cuece 20 minutos.', 'Tritura hasta obtener crema suave. Sazona y sirve con un hilo de crema.'],
  },
  {
    name: 'Pollo al limón con hierbas',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&h=300&fit=crop',
    time: 40, calories: 380, difficulty: 'Fácil', category: 'Cena', servings: 2,
    ingredients: [
      { name: '2 pechugas de pollo', kcal: 440 },
      { name: 'Jugo de 2 limones', kcal: 15 },
      { name: '3 dientes de ajo', kcal: 15 },
      { name: 'Romero y tomillo frescos', kcal: 5 },
      { name: '3 cucharadas de aceite de oliva', kcal: 270 },
      { name: 'Sal y pimienta', kcal: 0 },
    ],
    steps: ['Marina el pollo con limón, ajo, hierbas y aceite durante 30 min.', 'Calienta la sartén a fuego alto.', 'Cocina el pollo 6-7 minutos por cada lado.', 'Deja reposar 5 minutos antes de cortar.', 'Sirve con la marinada reducida por encima.'],
  },
  {
    name: 'Lentejas con verduras',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    time: 45, calories: 340, difficulty: 'Fácil', category: 'Comida', servings: 4,
    ingredients: [
      { name: '400g de lentejas pardinas', kcal: 600 },
      { name: '1 cebolla', kcal: 40 },
      { name: '2 zanahorias', kcal: 50 },
      { name: '2 patatas', kcal: 320 },
      { name: '1 pimiento rojo', kcal: 30 },
      { name: '3 dientes de ajo', kcal: 15 },
      { name: '1 cucharadita de pimentón', kcal: 5 },
      { name: 'Aceite de oliva, sal y laurel', kcal: 90 },
    ],
    steps: ['Pica todas las verduras en dados pequeños.', 'Sofríe ajo, cebolla y pimiento 5 minutos.', 'Añade las lentejas, verduras, pimentón y laurel.', 'Cubre con agua y cuece 30-35 minutos a fuego medio.', 'Rectifica de sal y sirve caliente.'],
  },
  {
    name: 'Ensalada César clásica',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop',
    time: 20, calories: 350, difficulty: 'Fácil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '1 lechuga romana', kcal: 20 },
      { name: '100g de pechuga de pollo a la plancha', kcal: 110 },
      { name: 'Crutones de pan', kcal: 160 },
      { name: 'Queso parmesano rallado', kcal: 120 },
      { name: '2 cucharadas de salsa César', kcal: 240 },
      { name: 'Pimienta negra', kcal: 0 },
    ],
    steps: ['Lava y seca la lechuga. Córtala en trozos grandes.', 'Corta el pollo en tiras.', 'Mezcla la lechuga con la salsa César.', 'Añade el pollo, los crutones y el parmesano.', 'Sazona con pimienta y sirve inmediatamente.'],
  },
  {
    name: 'Porridge de avena con plátano',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop',
    time: 10, calories: 320, difficulty: 'Fácil', category: 'Desayuno', servings: 1,
    ingredients: [
      { name: '80g de copos de avena', kcal: 290 },
      { name: '250 ml de leche o bebida vegetal', kcal: 50 },
      { name: '1 plátano maduro', kcal: 90 },
      { name: '1 cucharada de miel', kcal: 60 },
      { name: 'Canela al gusto', kcal: 0 },
      { name: 'Frutos secos opcionales', kcal: 0 },
    ],
    steps: ['Hierve la leche en un cazo.', 'Añade los copos de avena y remueve constantemente.', 'Cocina 5 minutos a fuego bajo hasta que espese.', 'Sirve en un bol con el plátano en rodajas.', 'Añade miel, canela y frutos secos al gusto.'],
  },
  {
    name: 'Tacos de atún',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
    time: 15, calories: 290, difficulty: 'Fácil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '4 tortillas de maíz', kcal: 200 },
      { name: '2 latas de atún al natural', kcal: 140 },
      { name: '1 aguacate', kcal: 160 },
      { name: 'Tomate picado', kcal: 20 },
      { name: 'Cilantro fresco', kcal: 2 },
      { name: 'Jugo de lima', kcal: 8 },
      { name: 'Sriracha al gusto', kcal: 10 },
    ],
    steps: ['Escurre bien el atún.', 'Aplasta el aguacate con lima y sal.', 'Calienta las tortillas en sartén seca.', 'Unta el aguacate en cada tortilla.', 'Añade el atún, tomate y cilantro. Añade sriracha al gusto.'],
  },
  {
    name: 'Banana bread integral',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop',
    time: 60, calories: 240, difficulty: 'Media', category: 'Snack', servings: 8,
    ingredients: [
      { name: '3 plátanos muy maduros', kcal: 270 },
      { name: '2 huevos', kcal: 150 },
      { name: '60g de mantequilla derretida', kcal: 430 },
      { name: '150g de harina integral', kcal: 500 },
      { name: '1 cucharadita de levadura', kcal: 5 },
      { name: '50g de miel o azúcar moreno', kcal: 190 },
      { name: 'Canela y nuez moscada', kcal: 5 },
    ],
    steps: ['Precalienta el horno a 175°C.', 'Aplasta los plátanos con un tenedor hasta hacer puré.', 'Mezcla con huevos, mantequilla y miel.', 'Incorpora la harina, levadura y especias. No sobrebatas.', 'Vierte en un molde y hornea 55-60 minutos.', 'Deja enfriar antes de desmoldar.'],
  },
  {
    name: 'Yogur parfait con granola',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    time: 5, calories: 280, difficulty: 'Fácil', category: 'Desayuno', servings: 1,
    ingredients: [
      { name: '200g de yogur griego', kcal: 130 },
      { name: '50g de granola casera', kcal: 100 },
      { name: '1/2 taza de frutos rojos', kcal: 30 },
      { name: '1 cucharada de miel', kcal: 60 },
      { name: 'Menta fresca para decorar', kcal: 2 },
    ],
    steps: ['Coloca el yogur en el fondo de un vaso alto.', 'Añade una capa de frutos rojos.', 'Cubre con granola.', 'Repite las capas si el vaso es grande.', 'Añade la miel y decora con menta.'],
  },
  {
    name: 'Sopa minestrone',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    time: 40, calories: 220, difficulty: 'Fácil', category: 'Cena', servings: 4,
    ingredients: [
      { name: '2 tomates', kcal: 36 },
      { name: '2 zanahorias', kcal: 50 },
      { name: '2 tallos de apio', kcal: 14 },
      { name: '1 calabacín', kcal: 30 },
      { name: '100g de judías verdes', kcal: 30 },
      { name: '100g de pasta pequeña', kcal: 350 },
      { name: '1 lata de tomate triturado', kcal: 50 },
      { name: 'Caldo de verduras, sal y albahaca', kcal: 60 },
    ],
    steps: ['Trocea todas las verduras en dados pequeños.', 'Sofríe zanahoria y apio 5 minutos en aceite.', 'Añade el resto de verduras y el tomate triturado.', 'Cubre con caldo y cuece 20 minutos.', 'Añade la pasta y cuece 10 minutos más. Sirve con albahaca.'],
  },
  {
    name: 'Pizza integral de vegetales',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    time: 45, calories: 420, difficulty: 'Media', category: 'Cena', servings: 2,
    ingredients: [
      { name: '1 base de pizza integral', kcal: 480 },
      { name: '3 cucharadas de tomate frito', kcal: 45 },
      { name: '1 bola de mozzarella', kcal: 250 },
      { name: '1/2 pimiento rojo', kcal: 18 },
      { name: '1/2 cebolla morada', kcal: 20 },
      { name: '6 champiñones', kcal: 20 },
      { name: 'Orégano y albahaca', kcal: 0 },
    ],
    steps: ['Precalienta el horno a 220°C.', 'Extiende el tomate sobre la masa.', 'Corta las verduras en rodajas finas y distribúyelas.', 'Añade la mozzarella desmenuzada.', 'Hornea 12-15 minutos hasta que los bordes doren.', 'Decora con albahaca fresca.'],
  },
  {
    name: 'Ensalada de garbanzos mediterránea',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    time: 10, calories: 310, difficulty: 'Fácil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '400g de garbanzos cocidos', kcal: 300 },
      { name: '1 pepino', kcal: 16 },
      { name: '100g de tomates cherry', kcal: 18 },
      { name: '1/2 cebolla roja', kcal: 20 },
      { name: '50g de queso feta', kcal: 133 },
      { name: 'Aceitunas negras', kcal: 60 },
      { name: 'Aceite de oliva, limón y orégano', kcal: 75 },
    ],
    steps: ['Escurre y aclara los garbanzos.', 'Corta el pepino, tomates y cebolla en dados.', 'Mezcla todo en un bol grande.', 'Aliña con aceite, limón y orégano.', 'Desmenúza el feta por encima y añade las aceitunas.'],
  },
  {
    name: 'Smoothie bowl de mango y piña',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
    time: 8, calories: 240, difficulty: 'Fácil', category: 'Desayuno', servings: 1,
    ingredients: [
      { name: '1 taza de mango congelado', kcal: 100 },
      { name: '1/2 taza de piña congelada', kcal: 40 },
      { name: '1/4 taza de leche de coco', kcal: 45 },
      { name: 'Kiwi y frutos tropicales para decorar', kcal: 50 },
      { name: 'Semillas de chía', kcal: 24 },
      { name: 'Coco rallado', kcal: 20 },
    ],
    steps: ['Tritura el mango y la piña congelados con la leche de coco.', 'La textura debe ser espesa, como un helado suave.', 'Vierte en un bol.', 'Decora con kiwi, fruta y semillas de chía.', 'Añade coco rallado y sirve inmediatamente.'],
  },
  {
    name: 'Tortitas de avena sin gluten',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop',
    time: 20, calories: 260, difficulty: 'Fácil', category: 'Desayuno', servings: 2,
    ingredients: [
      { name: '100g de copos de avena (sin gluten)', kcal: 370 },
      { name: '2 huevos', kcal: 150 },
      { name: '1 plátano maduro', kcal: 90 },
      { name: '1 cucharadita de levadura', kcal: 5 },
      { name: 'Canela', kcal: 0 },
      { name: 'Aceite de coco para cocinar', kcal: 60 },
      { name: 'Arándanos o miel para servir', kcal: 30 },
    ],
    steps: ['Mezcla avena, huevos, plátano aplastado, levadura y canela.', 'Deja reposar 5 minutos para que espese.', 'Calienta una sartén con unas gotas de aceite de coco.', 'Vierte porciones pequeñas y cocina 2-3 minutos por lado.', 'Sirve con arándanos y un chorrito de miel.'],
  },
  {
    name: 'Pollo al wok con vegetales',
    image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop',
    time: 25, calories: 370, difficulty: 'Fácil', category: 'Cena', servings: 2,
    ingredients: [
      { name: '300g de pechuga de pollo', kcal: 330 },
      { name: '1 brócoli', kcal: 50 },
      { name: '1 pimiento rojo', kcal: 30 },
      { name: '2 zanahorias', kcal: 50 },
      { name: '2 cucharadas de salsa de soja', kcal: 15 },
      { name: '1 cucharadita de jengibre rallado', kcal: 5 },
      { name: '2 dientes de ajo', kcal: 10 },
      { name: 'Aceite de sésamo', kcal: 90 },
    ],
    steps: ['Corta el pollo y las verduras en trozos pequeños.', 'Calienta el wok a fuego muy alto con aceite de sésamo.', 'Saltea el pollo 4 minutos hasta dorar.', 'Añade las verduras y saltea 3-4 minutos más.', 'Agrega soja, ajo y jengibre. Saltea 1 minuto y sirve.'],
  },
  {
    name: 'Crema de calabacín con queso',
    image: 'https://images.unsplash.com/photo-1547592167-e7e91c08de59?w=400&h=300&fit=crop',
    time: 30, calories: 160, difficulty: 'Fácil', category: 'Cena', servings: 4,
    ingredients: [
      { name: '4 calabacines', kcal: 80 },
      { name: '1 cebolla', kcal: 40 },
      { name: '200g de queso crema', kcal: 400 },
      { name: '500 ml de caldo de pollo', kcal: 30 },
      { name: 'Aceite de oliva', kcal: 90 },
      { name: 'Sal, pimienta y cebollino', kcal: 0 },
    ],
    steps: ['Trocea los calabacines y la cebolla.', 'Sofríe la cebolla 5 minutos en aceite.', 'Añade el calabacín y el caldo. Cuece 15 minutos.', 'Retira del fuego y añade el queso crema.', 'Tritura hasta obtener crema suave. Decora con cebollino.'],
  },
  {
    name: 'Risotto de setas',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    time: 35, calories: 410, difficulty: 'Difícil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '200g de arroz arborio', kcal: 270 },
      { name: '300g de setas variadas', kcal: 60 },
      { name: '1 cebolla', kcal: 40 },
      { name: '100 ml de vino blanco', kcal: 70 },
      { name: '800 ml de caldo caliente', kcal: 50 },
      { name: '50g de parmesano', kcal: 210 },
      { name: '2 cucharadas de mantequilla', kcal: 150 },
      { name: 'Aceite de oliva y sal', kcal: 60 },
    ],
    steps: ['Sofríe la cebolla picada en aceite y mantequilla.', 'Añade el arroz y tuesta 2 minutos.', 'Vierte el vino y deja evaporar.', 'Añade el caldo caliente cazo a cazo, removiendo constantemente.', 'Saltea las setas por separado y añade al risotto.', 'Apaga el fuego, añade mantequilla y parmesano. Reposa 2 minutos.'],
  },
  {
    name: 'Muffins de arándanos y avena',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop',
    time: 35, calories: 190, difficulty: 'Fácil', category: 'Snack', servings: 12,
    ingredients: [
      { name: '200g de harina integral', kcal: 660 },
      { name: '80g de copos de avena', kcal: 290 },
      { name: '150g de arándanos', kcal: 85 },
      { name: '2 huevos', kcal: 150 },
      { name: '150 ml de leche', kcal: 70 },
      { name: '60 ml de aceite de oliva suave', kcal: 530 },
      { name: '80g de miel', kcal: 240 },
      { name: '1 cucharadita de levadura', kcal: 5 },
    ],
    steps: ['Precalienta el horno a 180°C. Prepara un molde de 12 muffins.', 'Mezcla los ingredientes secos en un bol.', 'Bate los ingredientes líquidos por separado.', 'Une ambas mezclas sin sobrebatir. Incorpora los arándanos.', 'Rellena el molde y hornea 20-25 minutos.'],
  },
  {
    name: 'Salmón teriyaki con arroz',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    time: 25, calories: 450, difficulty: 'Media', category: 'Cena', servings: 2,
    ingredients: [
      { name: '2 filetes de salmón', kcal: 420 },
      { name: '4 cucharadas de salsa de soja', kcal: 25 },
      { name: '2 cucharadas de mirin', kcal: 40 },
      { name: '1 cucharada de azúcar moreno', kcal: 30 },
      { name: '1 diente de ajo', kcal: 5 },
      { name: 'Jengibre rallado', kcal: 5 },
      { name: '200g de arroz jazmín', kcal: 260 },
      { name: 'Sésamo y cebolleta para decorar', kcal: 20 },
    ],
    steps: ['Mezcla soja, mirin, azúcar, ajo y jengibre para la salsa teriyaki.', 'Marina el salmón 15 minutos en la salsa.', 'Cuece el arroz según instrucciones.', 'Cocina el salmón en sartén caliente 3-4 min por lado.', 'Glaseado con el resto de la salsa. Decora con sésamo y cebolleta.'],
  },
  {
    name: 'Ceviche de gambas',
    image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop',
    time: 20, calories: 180, difficulty: 'Fácil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '300g de gambas cocidas', kcal: 210 },
      { name: 'Jugo de 4 limas', kcal: 25 },
      { name: '1 tomate', kcal: 18 },
      { name: '1/2 cebolla roja', kcal: 20 },
      { name: '1 aguacate', kcal: 160 },
      { name: '1 chile verde', kcal: 5 },
      { name: 'Cilantro fresco', kcal: 2 },
      { name: 'Sal y pimienta', kcal: 0 },
    ],
    steps: ['Mezcla las gambas con el jugo de lima y deja marinar 10 minutos.', 'Pica tomate, cebolla y chile en dados muy pequeños.', 'Corta el aguacate en cubos.', 'Mezcla todo con las gambas marinadas.', 'Sazona, añade cilantro y sirve frío con tostadas.'],
  },
  {
    name: 'Granola casera',
    image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=400&h=300&fit=crop',
    time: 30, calories: 200, difficulty: 'Fácil', category: 'Snack', servings: 10,
    ingredients: [
      { name: '300g de copos de avena gruesos', kcal: 1080 },
      { name: '100g de frutos secos mixtos', kcal: 600 },
      { name: '3 cucharadas de miel', kcal: 190 },
      { name: '3 cucharadas de aceite de coco', kcal: 360 },
      { name: '1 cucharadita de canela', kcal: 5 },
      { name: '50g de semillas (girasol, calabaza)', kcal: 275 },
      { name: 'Frutas deshidratadas al gusto', kcal: 90 },
    ],
    steps: ['Precalienta el horno a 160°C.', 'Mezcla la avena, frutos secos y semillas en un bol.', 'Calienta la miel y el aceite de coco juntos.', 'Vierte sobre la mezcla de avena y remueve bien.', 'Extiende en una bandeja y hornea 20-25 minutos removiendo a mitad.', 'Deja enfriar completamente antes de añadir las frutas deshidratadas.'],
  },
  {
    name: 'Ensalada de quinoa y aguacate',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    time: 15, calories: 320, difficulty: 'Fácil', category: 'Comida', servings: 2,
    ingredients: [
      { name: '1 taza de quinoa cocida', kcal: 220 },
      { name: '1 aguacate maduro', kcal: 160 },
      { name: '10 tomates cherry', kcal: 25 },
      { name: '1/2 pepino', kcal: 10 },
      { name: '2 cucharadas de aceite de limón', kcal: 180 },
      { name: 'Sal, pimienta y cilantro', kcal: 0 },
    ],
    steps: ['Cuece la quinoa según instrucciones y deja enfriar.', 'Corta el aguacate, tomates y pepino.', 'Mezcla todo en un bol.', 'Aliña con aceite de limón, sal y pimienta.', 'Decora con cilantro fresco.'],
  },
  {
    name: 'Bowl de acai con frutos rojos',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    time: 10, calories: 280, difficulty: 'Fácil', category: 'Desayuno', servings: 1,
    ingredients: [
      { name: '100g de pulpa de acai congelada', kcal: 70 },
      { name: '1/2 plátano congelado', kcal: 45 },
      { name: '50 ml de leche de almendras', kcal: 10 },
      { name: 'Frutos rojos frescos', kcal: 30 },
      { name: 'Granola', kcal: 100 },
      { name: 'Semillas de chía', kcal: 24 },
      { name: 'Miel al gusto', kcal: 30 },
    ],
    steps: ['Tritura el acai congelado con el plátano y la leche.', 'La mezcla debe quedar muy espesa.', 'Vierte en un bol frío.', 'Decora con frutos rojos, granola y semillas.', 'Añade un chorrito de miel y sirve inmediatamente.'],
  },
  {
    name: 'Salmón al horno con vegetales',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    time: 25, calories: 425, difficulty: 'Fácil', category: 'Cena', servings: 2,
    ingredients: [
      { name: '2 lomos de salmón', kcal: 420 },
      { name: '1 calabacín', kcal: 30 },
      { name: '1 pimiento amarillo', kcal: 25 },
      { name: '200g de tomates cherry', kcal: 36 },
      { name: '3 cucharadas de aceite de oliva', kcal: 270 },
      { name: 'Romero, sal y pimienta', kcal: 0 },
      { name: 'Limón para servir', kcal: 8 },
    ],
    steps: ['Precalienta el horno a 200°C.', 'Corta las verduras y colócalas en una bandeja.', 'Añade el salmón encima, aliña todo con aceite y especias.', 'Hornea 18-20 minutos.', 'Sirve con limón exprimido por encima.'],
  },
  {
    name: 'Batido verde energizante',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002f?w=400&h=300&fit=crop',
    time: 5, calories: 160, difficulty: 'Fácil', category: 'Snack', servings: 1,
    ingredients: [
      { name: '2 puñados de espinacas baby', kcal: 20 },
      { name: '1 plátano', kcal: 90 },
      { name: '1/2 manzana verde', kcal: 40 },
      { name: 'Jugo de 1/2 limón', kcal: 8 },
      { name: '200 ml de agua de coco', kcal: 38 },
      { name: '1 cucharada de semillas de lino', kcal: 37 },
    ],
    steps: ['Lava bien las espinacas.', 'Trocea el plátano y la manzana.', 'Pon todos los ingredientes en la batidora.', 'Tritura hasta obtener una textura suave.', 'Sirve inmediatamente para conservar los nutrientes.'],
  },
];

async function seed() {
  await migrate();

  for (const u of users) {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (rows[0]) { console.log(`Usuario ya existe: ${u.email}`); continue; }
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [u.name, u.email, hash]);
    console.log(`Usuario creado: ${u.email} / ${u.password}`);
  }

  for (const recipe of recipes) {
    const { rows } = await pool.query('SELECT id FROM recipes WHERE name = $1', [recipe.name]);

    if (rows[0]) {
      // Recipe exists — update kcal values for existing ingredients
      const id = rows[0].id;
      for (let i = 0; i < recipe.ingredients.length; i++) {
        await pool.query(
          'UPDATE recipe_ingredients SET kcal = $1 WHERE recipe_id = $2 AND sort_order = $3',
          [recipe.ingredients[i].kcal, id, i]
        );
      }
      // Recalculate stored calories from ingredients
      const calcCalories = recipe.ingredients.reduce((s, ing) => s + ing.kcal, 0);
      await pool.query('UPDATE recipes SET calories = $1 WHERE id = $2', [calcCalories, id]);
      console.log(`Kcal actualizadas: ${recipe.name} (${calcCalories} kcal total)`);
      continue;
    }

    const calcCalories = recipe.ingredients.reduce((s, ing) => s + ing.kcal, 0);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO recipes (name, image, time, calories, difficulty, category, servings) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [recipe.name, recipe.image, recipe.time, calcCalories, recipe.difficulty, recipe.category, recipe.servings]
      );
      const id = result.rows[0].id;
      for (let i = 0; i < recipe.ingredients.length; i++) {
        await client.query(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient, kcal, sort_order) VALUES ($1,$2,$3,$4)',
          [id, recipe.ingredients[i].name, recipe.ingredients[i].kcal, i]
        );
      }
      for (let i = 0; i < recipe.steps.length; i++) {
        await client.query('INSERT INTO recipe_steps (recipe_id, description, step_order) VALUES ($1,$2,$3)', [id, recipe.steps[i], i + 1]);
      }
      await client.query('COMMIT');
      console.log(`Receta añadida: ${recipe.name} (${calcCalories} kcal total)`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  const { rows: countRows } = await pool.query('SELECT COUNT(*) as n FROM recipes');
  const { rows: userRows } = await pool.query('SELECT id, name, email FROM users');
  console.log(`\nTotal recetas: ${countRows[0].n}`);
  console.log('\nUsuarios en la BD:');
  userRows.forEach((u: any) => console.log(`  - ${u.name} <${u.email}>`));
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
