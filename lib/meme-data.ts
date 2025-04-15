import { MemeTopic, MemeStyle } from '@/types/meme'

// Meme topics data with titles and thumbnails
export const memeTopics: MemeTopic[] = [
    {
        id: 'distracted-boyfriend',
        title: 'Distracted Boyfriend',
        thumbnail: '/images/topics/funny.png',
        letzai_model_name: '@meme_distracted_boyfriend'
    },
    {
        id: 'honest-work',
        title: 'But It\'s Honest Work',
        thumbnail: '/images/topics/office.png',
        letzai_model_name: '@meme_but_it_s_honest_work'
    },
    {
        id: 'monkey-puppet',
        title: 'Awkward Look Monkey Puppet',
        thumbnail: '/images/topics/gaming.png',
        letzai_model_name: '@meme_awkward_look_monkey_puppet'
    },
    {
        id: 'hide-pain-harold',
        title: 'Hide the Pain Harold',
        thumbnail: '/images/topics/tech.png',
        letzai_model_name: '@meme_hide_the_pain_harold'
    },
    {
        id: 'grumpy-cat',
        title: 'Grumpy Cat',
        thumbnail: '/images/topics/cats.png',
        letzai_model_name: '@meme_grumpy_cat'
    }
]

// Meme style options
export const memeStyles: MemeStyle[] = [
    {
        id: 'photorealistic',
        title: 'Photorealistic'
    },
    {
        id: 'studio-ghibli',
        title: 'Studio Ghibli'
    },
    {
        id: '80s-synthwave',
        title: '80s Synthwave'
    },
    {
        id: '3d-render',
        title: '3D Render'
    },
    {
        id: 'child-drawing',
        title: 'Child Drawing'
    },
    {
        id: 'watercolor',
        title: 'Watercolor'
    },
    {
        id: 'pixel-art',
        title: 'Pixel Art'
    },
    {
        id: 'illustration',
        title: 'Illustration'
    },
    {
        id: 'retro-futurism',
        title: 'Retro Futurism'
    },
    {
        id: 'steampunk',
        title: 'Steampunk'
    }
]