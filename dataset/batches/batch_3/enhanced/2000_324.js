setcpm(120/4);
$: s("bd*2 ~ bd*2 ~").lpf(1800).gain(0.8);
$: s("bass").slow(16).gain(0.4);
$: s("hh*8").gain(0.15);
