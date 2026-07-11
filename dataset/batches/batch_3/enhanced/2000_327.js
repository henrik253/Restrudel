setcpm(120/4);
$: note("f6 d6 b5").scale("c2:minor").cutoff(400).gain(0.8).lpf(650).room(0.3);
$: s("bd*2 ~").gain(0.8);
$: s("hh*8").gain(0.15);
