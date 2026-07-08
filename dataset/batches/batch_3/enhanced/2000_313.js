setcpm(120/4);
$: s("pad").gain(0.15).delay(0.25);
$: s("bd ~ sd ~").lpf(650).gain(0.8);
$: s("hh*8").gain(0.15);
