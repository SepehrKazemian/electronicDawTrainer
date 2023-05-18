#include <SDL.h>
#include <vector>
#include <iostream>

struct Box
{
    int id;
    int x;
    int y;
    int z;
    int w;
    SDL_Color backgroundColor;
};

using Row = std::vector<Box>;
using Grid = std::vector<Row>;

Grid createBoxes(int numInstruments, int numBarlines, int extraBeats, const std::vector<int> &noteWeightsMax)
{
    Grid grid(numInstruments);
    int barlineCounter = 0;

    for (int elem = 0; elem < noteWeightsMax.size(); ++elem)
    {
        if (noteWeightsMax[elem] == -1)
        {
            barlineCounter += 1;
            continue;
        }

        for (int i = 0; i < numInstruments; ++i)
        {
            for (int k = 0; k < noteWeightsMax[elem]; ++k)
            {
                for (int r = 0; r < extraBeats; ++r)
                {
                    Box box;
                    box.id = i * 10000 + barlineCounter * 1000 + (k * extraBeats) + r;
                    box.x = i;
                    box.y = barlineCounter;
                    box.z = k * extraBeats + r;
                    box.w = elem;

                    if (box.z % 2 == 1)
                    {
                        box.backgroundColor = {255, 255, 255, 255};
                    }
                    else
                    {
                        box.backgroundColor = {0, 0, 0, 0};
                    }

                    grid[i].push_back(box);
                }
            }
        }
    }

    return grid;
}

int main(int argc, char *argv[])
{
    std::vector<int> noteWeightsMax = {2, -1, 3, -1, 1, 4};
    int numInstruments = 4;
    int numBarlines = 3;
    int extraBeats = 2;

    Grid grid = createBoxes(numInstruments, numBarlines, extraBeats, noteWeightsMax);

    // Example of changing the color of a specific box
    grid[0][5].backgroundColor = {255, 0, 0, 255};

    // Initialize SDL
    SDL_Init(SDL_INIT_VIDEO);

    // Create the SDL window
    SDL_Window *window = SDL_CreateWindow("Grid Visualization", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, 800, 600, SDL_WINDOW_SHOWN);
    SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    int boxWidth = 20;
    int boxHeight = 20;
    int margin = 5;

    bool running = true;

    while (running)
    {
        SDL_Event event;

        while (SDL_PollEvent(&event))
        {
            if (event.type == SDL_QUIT)
            {
                running = false;
            }
        }

        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderClear(renderer);

        for (const auto &row : grid)
        {
            for (const auto &box : row)
            {
                SDL_Rect rect = {box.y * (boxWidth + margin), box.x * (boxHeight + margin), boxWidth, boxHeight};
                SDL_SetRenderDrawColor(renderer, box.backgroundColor.r, box.backgroundColor.g, box.backgroundColor.b, 255);

                if (box.z % 2 == 1)
                {
                    SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_NONE);
                }
                else
                {
                    SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
                }

                SDL_RenderFillRect(renderer, &rect);
            }
        }

        SDL_RenderPresent(renderer);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
