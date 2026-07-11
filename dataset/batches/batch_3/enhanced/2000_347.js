setcpm(120/4);
$: s("ellipse").velocity(0.6).gain(0.4);
$: s("bd ~ sd ~").gain(0.8).release(0.02);
$: note("c#4 c4").scale("c2:minor").gain(0.3);
