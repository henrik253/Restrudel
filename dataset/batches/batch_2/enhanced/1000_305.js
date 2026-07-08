setcpm(98/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)
$: note("D2 A2 G2").s("pulse").clip(.8258).release(.3).hpf(8000).gain(.4)
$: s("hh*16").gain(.2).hpf(1000).lpf(3200).room(.6981)
