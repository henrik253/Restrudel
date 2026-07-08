setcpm(120/4)
$: s("misc:2 ~ cymbal ~").clip(1).release(.3).attack(.02).gain(.6)
$: s("mt lt lt mt*2").clip(.85).release(.3).hpf(400).gain("0.4 0.5 0.4 0.5")
$: note("c2 ~ g1 ~").s("sawtooth").lpf(500).gain(.4).release(.2)
