setcpm(96/4)
$: s("~ ~ bd ~").lpf(650).gain(.8)
$: s("cp hh").slow(4).gain(.3)
$: note("a3 f3 c4 g3 a3 f3 c4 g3").s("sawtooth").lpf(650).gain(.35)
