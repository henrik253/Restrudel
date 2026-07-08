setcpm(110)

$: s("~ sd:2").lpf(5000).room(.7).gain(.8).pan(.6698).clip(.8)
$: note("g5 d5 e5 c5 b4").hpf(4000).gain(.8).lpf(500).room(.5)
$: note("e3 a3").s("square sawtooth").lpf(4781).room(1.0868)
