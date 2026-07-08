setcpm(90/4)
$: s("cr ~ bd ~").lpf(650).room(.6).gain(.6)
$: note("g2 ~ f#3 ~ e4 d#4").clip(.8).release(.05).s("sawtooth").gain(.4)
$: s("gm_ocarina").slow(2).gain(.4)
